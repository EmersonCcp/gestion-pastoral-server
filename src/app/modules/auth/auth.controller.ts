import {
  Controller,
  Post,
  Get,
  Body,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared/guards/jwt-auth.guard';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: CreateUsuarioDto })
  register(@Body() dto: CreateUsuarioDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuario y obtención de JWT' })
  @ApiBody({
    schema: {
      properties: { email: { type: 'string' }, password: { type: 'string' } },
    },
  })
  login(@Body() body: { email: string; password: string }) {
    // return this.authService
    //   .validateUser(body.email, body.password)
    //   .then((usuario: any) => {
    // if (!usuario) throw new UnauthorizedException('Credenciales inválidas');
    return this.authService.login(body);
    // });
  }

  @Post('logout')
  logout(@Req() req: any) {
    const authHeader = req.headers.authorization;

    const token = authHeader?.split(' ')[1];

    return this.authService.logout(token);
  }

  @Post('change-password')
  changePassword(@Body() body: { userId: number; newPassword: string }) {
    return this.authService.changePassword(body.userId, body.newPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }
}
