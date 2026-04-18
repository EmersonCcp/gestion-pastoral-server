import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { ApiResponse } from 'src/shared/types/response.types';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('permisos')
export class PermisosController {
  constructor(private readonly service: PermisosService) {}

  @Post()
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['permisos.create', 'permisos.*'])
  create(@Body() dto: CreatePermisoDto, @Req() req: Request) {
    const path = req.url;
    return this.service.create(dto, path);
  }

  @Get('by-user/:id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  async getPermisosByUsuario(
    @Param('id') id: number,
    @Req() req: any,
  ): Promise<ApiResponse<string[]>> {
    const user = req;

    const data = await this.service.findActionsByUsuario(id);

    return {
      ok: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        path: `/permisos/by-user/${id}`,
        version: 'v1',
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['permisos.read', 'permisos.*'])
  findAll(@Query() query: any) {
    try {
      return this.service.findAllData(
        Number(query.page),
        Number(query.per_page),
        query.sort_by,
        query.sort_dir,
        {
          accion: query.accion,
          sujeto: query.sujeto,
        },
      );
    } catch (error) {
      console.error('permisos ERROR DETAILS:', error);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['permisos.read', 'permisos.*'])
  findOne(@Param('id') id: string, @Req() req: Request) {
    const path = req.url;
    return this.service.findOne(id, path);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['permisos.update', 'permisos.*'])
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePermisoDto,
    @Req() req: Request,
  ) {
    const path = req.url;
    return this.service.update(id, dto, path);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard,SessionGuard)
  @RequirePermissions(['permisos.delete', 'permisos.*'])
  remove(@Param('id') id: number, @Req() req: Request) {
    const path = req.url;
    return this.service.removeData(id,'v1', path);
  }

  
}
