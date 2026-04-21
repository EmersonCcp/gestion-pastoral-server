import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, SessionGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Obtener estadísticas principales' })
  getStats(@Query('movimientoId') movimientoId?: number, @User() user?: any) {
    
    return this.service.getStats(user, movimientoId);
  }

  @Get('birthdays')
  @ApiOperation({ summary: 'Obtener cumpleañeros del mes' })
  getBirthdays(
    @Query('month') month?: number,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('movimientoId') movimientoId?: number | string,
    @User() user?: any,
  ) {
    const currentMonth = month || new Date().getMonth() + 1;
    return this.service.getBirthdays(+currentMonth, page ? +page : 1, per_page ? +per_page : 8, user, movimientoId);
  }
}
