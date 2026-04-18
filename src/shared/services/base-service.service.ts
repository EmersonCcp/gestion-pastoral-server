import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Repository,
  ObjectLiteral,
  FindOptionsWhere,
  FindOptionsRelations,
  FindOptionsSelect,
  DataSource,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiErrorResponse,
  ApiListResponse,
  ApiMeta,
  ApiResponse,
} from '../types/response.types';

export interface EntityValidation {
  repository: Repository<any>;
  field: string;
  entityName: string;
  required?: boolean;
}

export interface BaseServiceOptions {
  entityValidations?: EntityValidation[];
  defaultOrder?: { [key: string]: 'ASC' | 'DESC' };
}

@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  protected entityValidations: EntityValidation[] = [];
  protected defaultOrder: { [key: string]: 'ASC' | 'DESC' } = {
    createdAt: 'DESC',
  };

  constructor(
    protected readonly repo: Repository<T>,
    protected readonly dataSource: DataSource,
    options?: BaseServiceOptions,
  ) {
    if (options?.entityValidations) {
      this.entityValidations = options.entityValidations;
    }
    if (options?.defaultOrder) {
      this.defaultOrder = options.defaultOrder;
    }
  }

  /**
   * Valida entidades relacionadas antes de crear o actualizar
   */
  protected async validateRelatedEntities(
    dto: any,
  ): Promise<{ [key: string]: any }> {
    const relations: { [key: string]: any } = {};

    for (const validation of this.entityValidations) {
      const { repository, field, entityName, required = false } = validation;
      const entityId = dto[field];

      // Si el campo es requerido y no viene, lanzar error
      if (required && !entityId) {
        throw new Error(`${entityName} is required`);
      }

      // Si viene el ID, validar que exista
      if (entityId) {
        const entity = await repository.findOneBy({
          id: entityId,
        } as FindOptionsWhere<any>);
        if (!entity) {
          throw new NotFoundException(
            `${entityName} with ID ${entityId} not found`,
          );
        }
        relations[field] = entity;
      }
    }

    return relations;
  }

  /**
   * Crea una nueva entidad
   */
  async create(
    dto: any,
    path: string,
    customTransform?: (dto: any, relations: any) => any,
  ): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      // Validar entidades relacionadas
      const relations = await this.validateRelatedEntities(dto);

      // Preparar datos para crear
      const createData = customTransform
        ? customTransform(dto, relations)
        : { ...dto, ...relations };

      const data = this.repo.create(createData);
      const saved = await this.repo.save(data);

      return this.buildSuccessResponse(saved, path);
    } catch (error) {
      return this.buildErrorResponse(
        'CREATE_FAILED',
        `Failed to create entity: ${error.message}`,
        path,
      );
    }
  }

 async findAll(opts, user?) {
  try {
    const {
      page = 1,
      per_page = 10,
      search,
      filters = {},
      sort_by = 'created_at',
      sort_dir = 'DESC',
      path = '',
      version = 'v1',
      relations = [],
      fields = [],
    } = opts;

    const qb = this.repo.createQueryBuilder('t');

    // -----------------------------------------
    // SELECT dinámico
    // -----------------------------------------
    if (Array.isArray(fields) && fields.length > 0) {
      qb.select(
        fields.map((field) => (field.includes('.') ? field : `t.${field}`)),
      );
    }

    // -----------------------------------------
    // 1️⃣ Relaciones dinámicas
    // -----------------------------------------
    relations.forEach((relationPath) => {
      const parts = relationPath.split('.');
      let parentAlias = 't';
      let currentPath = '';

      parts.forEach((part) => {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        const alias = currentPath.replace('.', '_');

        if (
          !qb.expressionMap.joinAttributes.some(
            (j) => j.alias?.name === alias,
          )
        ) {
          qb.leftJoin(`${parentAlias}.${part}`, alias);
        }

        parentAlias = alias;
      });
    });

    // -----------------------------------------
    // Helper: detectar UUID
    // -----------------------------------------
    const isUUID = (val: any) =>
      typeof val === 'string' && /^[0-9a-fA-F-]{36}$/.test(val);

    // -----------------------------------------
    // 2️⃣ Filtros dinámicos
    // -----------------------------------------
    for (const key of Object.keys(filters)) {
      const value = filters[key];

      if (value === undefined || value === null || value === '') continue;

      // 🔥 Relación (objeto)
      if (typeof value === 'object' && !Array.isArray(value)) {
        for (const subKey of Object.keys(value)) {
          const subValue = value[subKey];

          if (isUUID(subValue) || typeof subValue === 'number') {
            qb.andWhere(`${key}.${subKey} = :${key}_${subKey}`, {
              [`${key}_${subKey}`]: subValue,
            });
          } else {
            qb.andWhere(
              `LOWER(${key}.${subKey}) LIKE LOWER(:${key}_${subKey})`,
              { [`${key}_${subKey}`]: `%${subValue}%` },
            );
          }
        }
        continue;
      }

      // UUID
      if (isUUID(value)) {
        qb.andWhere(`t.${key} = :${key}`, { [key]: value });
        continue;
      }

      // ENUM (MAYÚSCULAS)
      if (typeof value === 'string' && /^[A-Z0-9_]+$/.test(value)) {
        qb.andWhere(`t.${key} = :${key}`, { [key]: value });
        continue;
      }

      // Número
      if (typeof value === 'number') {
        qb.andWhere(`t.${key} = :${key}`, { [key]: value });
        continue;
      }

      // 🔥 Texto (SQL Server safe)
      if (typeof value === 'string') {
        qb.andWhere(`LOWER(t.${key}) LIKE LOWER(:${key})`, {
          [key]: `%${value}%`,
        });
      }
    }

    // -----------------------------------------
    // 3️⃣ Search global (solo strings)
    // -----------------------------------------
    if (search) {
      const conditions: string[] = [];

      for (const key of Object.keys(filters)) {
        const field = key.includes('.') ? key : `t.${key}`;

        // Solo aplicar LIKE si es texto (evitamos errores)
        conditions.push(`LOWER(${field}) LIKE LOWER(:search)`);
      }

      if (conditions.length) {
        qb.andWhere(`(${conditions.join(' OR ')})`, {
          search: `%${search}%`,
        });
      }
    }

    // -----------------------------------------
    // 4️⃣ Orden
    // -----------------------------------------
    if (sort_by.includes('.')) {
      const [rel, col] = sort_by.split('.');
      qb.orderBy(`${rel}.${col}`, sort_dir.toUpperCase() as 'ASC' | 'DESC');
    } else {
      qb.orderBy(`t.${sort_by}`, sort_dir.toUpperCase() as 'ASC' | 'DESC');
    }

    // -----------------------------------------
    // 5️⃣ Paginación (compatible SQL Server)
    // -----------------------------------------
    qb.skip((page - 1) * per_page).take(per_page);

    // -----------------------------------------
    // 6️⃣ Ejecutar
    // -----------------------------------------
    const [data, total] = await qb.getManyAndCount();

    return {
      ok: true,
      data,
      meta: {
        requestId: uuidv4?.() ?? null,
        timestamp: new Date().toISOString(),
        path,
        version,
        paging: {
          page,
          per_page,
          total_items: total,
          total_pages: Math.ceil(total / per_page),
        },
        sort: [{ by: sort_by, dir: sort_dir }],
        filters,
      },
    };
  } catch (error) {
    console.error('Error in findAll():', error);

    return {
      ok: false,
      error: {
        code: 'FIND_ALL_FAILED',
        message: error.message,
      },
      meta: {
        requestId: uuidv4?.() ?? null,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

  async findOne(
    idValue: string | number,
    path = '',
    version = 'v1',
    options?: {
      relations?: FindOptionsRelations<T>;
      select?: FindOptionsSelect<T>;
    },
  ): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      const pkColumn = this.repo.metadata.primaryColumns[0];
      const pkName = pkColumn.propertyName;

      let pkValue: any = idValue;

      // Cast automático
      if (pkColumn.type === Number || pkColumn.type === 'int') {
        pkValue = Number(idValue);
      }

      const data = await this.repo.findOne({
        where: { [pkName]: pkValue } as FindOptionsWhere<T>,
        ...options,
      });

      if (!data) {
        throw new NotFoundException(
          `Entity with ${pkName} = ${pkValue} not found`,
        );
      }

      return this.buildSuccessResponse(data, path, version);
    } catch (error) {
      return this.buildErrorResponse(
        'FIND_ONE_FAILED',
        `Failed to find entity: ${error.message}`,
        path,
        version,
      );
    }
  }

  /**
   * Actualiza una entidad (PK dinámico)
   */
  async update(
    idValue: string | number,
    dto: any,
    path = '',
    version = 'v1',
    customTransform?: (existing: T, dto: any, relations: any) => T,
  ): Promise<ApiResponse<T> | ApiErrorResponse> {
    try {
      const pkColumn = this.repo.metadata.primaryColumns[0];

      if (!pkColumn) {
        throw new Error('Primary key not found');
      }

      const pkName = pkColumn.propertyName;

      // Cast automático del ID según tipo
      let pkValue: any = idValue;
      if (pkColumn.type === Number || pkColumn.type === 'int') {
        pkValue = Number(idValue);
        if (Number.isNaN(pkValue)) {
          throw new Error(`Invalid ${pkName} value`);
        }
      }

      // Buscar entidad existente
      const existing = await this.repo.findOne({
        where: { [pkName]: pkValue } as FindOptionsWhere<T>,
      });

      if (!existing) {
        throw new NotFoundException(
          `Entity with ${pkName} = ${pkValue} not found`,
        );
      }

      // Validar relaciones (si existen)
      const relations = await this.validateRelatedEntities(dto);

      // Transformación personalizada o merge directo
      const updatedEntity = customTransform
        ? customTransform(existing, dto, relations)
        : Object.assign(existing, dto, relations);

      const saved = await this.repo.save(updatedEntity);

      return this.buildSuccessResponse(saved, path, version);
    } catch (error) {
      return this.buildErrorResponse(
        'UPDATE_FAILED',
        `Failed to update entity: ${error.message}`,
        path,
        version,
      );
    }
  }

  /**
   * Elimina una entidad (PK dinámico)
   */
  async remove(
    idValue: string | number,
    path = '',
    version = 'v1',
  ): Promise<ApiResponse<{ deleted: true }> | ApiErrorResponse> {
    try {
      const pkColumn = this.repo.metadata.primaryColumns[0];

      if (!pkColumn) {
        throw new Error('Primary key not found');
      }

      const pkName = pkColumn.propertyName;

      // Cast automático del ID
      let pkValue: any = idValue;
      if (pkColumn.type === Number || pkColumn.type === 'int') {
        pkValue = Number(idValue);
        if (Number.isNaN(pkValue)) {
          throw new Error(`Invalid ${pkName} value`);
        }
      }

      const existing = await this.repo.findOne({
        where: { [pkName]: pkValue } as FindOptionsWhere<T>,
      });

      if (!existing) {
        throw new NotFoundException(
          `Entity with ${pkName} = ${pkValue} not found`,
        );
      }

      await this.repo.remove(existing);

      return this.buildSuccessResponse({ deleted: true }, path, version);
    } catch (error) {
      return this.buildErrorResponse(
        'DELETE_FAILED',
        `Failed to delete entity: ${error.message}`,
        path,
        version,
      );
    }
  }

  async runQuery<T = any>(
    sql: string,
    parameters: any[] = [],
    opts?: {
      page?: number;
      per_page?: number;
      path?: string;
      version?: string;
      filters?: any;
      sort?: { by: string; dir: 'asc' | 'desc' }[];
    },
  ): Promise<ApiListResponse<T> | ApiErrorResponse> {
    const {
      page = 1,
      per_page = 10,
      path = '',
      version = 'v1',
      filters = {},
      sort = [],
    } = opts || {};

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result: T[] = await queryRunner.query(sql, parameters);

      /**
       * Convención:
       * si la query trae una columna "total", se usa para paginación
       */
      const total =
        Array.isArray(result) &&
        result.length > 0 &&
        (result[0] as any)?.total !== undefined
          ? Number((result[0] as any).total)
          : result.length;

      await queryRunner.commitTransaction();

      return {
        ok: true,
        data: result,
        meta: {
          ...this.buildMeta(path, version),
          paging: {
            page,
            per_page,
            total_items: total,
            total_pages: Math.ceil(total / per_page),
          },
          sort,
          filter: filters,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      return this.buildErrorResponse(
        'RUN_QUERY_FAILED',
        error.message,
        path,
        version,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Métodos auxiliares para construir respuestas
   */
  protected buildSuccessResponse(
    data: any,
    path: string,
    version = 'v1',
  ): ApiResponse<any> {
    return {
      ok: true,
      data,
      meta: this.buildMeta(path, version),
    };
  }

  protected buildListResponse(
    data: any[],
    total: number,
    page: number,
    per_page: number,
    filters: any,
    path: string,
    version = 'v1',
  ): ApiListResponse<any> {
    return {
      ok: true,
      data,
      meta: {
        ...this.buildMeta(path, version),
        paging: {
          page,
          per_page,
          total_items: total,
          total_pages: Math.ceil(total / per_page),
        },
        sort: Object.entries(this.defaultOrder).map(([by, dir]) => ({
          by,
          dir: dir.toLowerCase() as 'asc' | 'desc',
        })),
        filter: filters,
      },
    };
  }

  buildErrorResponse(
    code: string,
    message: string,
    path: string,
    version = 'v1',
  ): ApiErrorResponse {
    return {
      ok: false,
      error: { code, message },
      meta: this.buildMeta(path, version),
    };
  }

  protected buildMeta(path: string, version = 'v1'): ApiMeta {
    return {
      requestId: uuidv4(),
      timestamp: new Date().toISOString(),
      path,
      version,
    };
  }
}
