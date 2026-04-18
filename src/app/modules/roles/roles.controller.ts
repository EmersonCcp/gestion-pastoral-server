import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { Rol } from './entities/role.entity';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['roles.create', 'roles.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo rol' })
  @ApiResponse({ status: 201, description: 'Rol creado', type: Rol })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: any, @Req() req: Request) {
    const path = req.url;
    return this.rolesService.createWithPermissions(dto, path);
  }

  @Get()
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['roles.read', 'roles.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar todos los roles' })
  @ApiResponse({ status: 200, description: 'Listado de roles', type: [Rol] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  @ApiQuery({ name: 'nombre', required: false, type: String })
  @ApiQuery({ name: 'descripcion', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sort_by', required: false, type: String })
  @ApiQuery({
    name: 'sort_dir',
    required: false,
    type: String,
    enum: ['ASC', 'DESC'],
  })
  findAll(@Query() query: any) {
    try {
      return this.rolesService.findAll({
        page: Number(query.page),
        per_page: Number(query.per_page),
        search: query.search,
        filters: {
          nombre: query.nombre,
          descripcion: query.descripcion,
        },
        sort_by: query.sort_by,
        sort_dir: query.sort_dir,
      });
    } catch (error) {
      console.error('roles ERROR DETAILS:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['roles.read', 'roles.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener rol por ID' })
  @ApiParam({ name: 'id', description: 'UUID del rol' })
  @ApiResponse({ status: 200, description: 'Rol encontrado', type: Rol })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  @ApiResponse({ status: 401, description: 'Token inválido' })
  findOne(@Param('id') id: number, @Req() req: Request) {
    const path = req.url;
    return this.rolesService.findOne(id, path, 'v1', {
      relations: { rolPermisos: { permiso: true } },
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['roles.update', 'roles.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar rol' })
  @ApiResponse({ status: 200, description: 'Rol actualizado', type: Rol })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  update(@Param('id') id: number, @Body() dto: any, @Req() req: Request) {
    const path = req.url;
    return this.rolesService.updateWithPermissions(id, dto, path);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['roles.delete', 'roles.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar rol (soft-delete)' })
  @ApiResponse({ status: 204, description: 'Rol eliminado' })
  @ApiResponse({ status: 404, description: 'Rol no encontrado' })
  remove(@Param('id') id: number, @Req() req: Request) {
    const path = req.url;
    return this.rolesService.removeData(id, 'v1',path);
  }
}
