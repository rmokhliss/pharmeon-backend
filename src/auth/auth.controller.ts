import { Controller, Post, Get, Body, Patch, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsString, MinLength, IsEmail, IsOptional } from 'class-validator';

class LoginDto {
  @IsString() email: string;
  @IsString() @MinLength(1) password: string;
}

class RegisterPublicDto {
  @IsString() @MinLength(1) nom: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() telephone?: string;
  @IsString() @MinLength(4) password: string;
}

class AdminLoginDto {
  @IsString() username: string;
  @IsString() password: string;
}

class SetPasswordDto {
  @IsString() @MinLength(4) password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('register-public')
  registerPublic(@Body() dto: RegisterPublicDto) {
    return this.auth.registerPublic(dto);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLogin(dto.username, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Request() req: any) {
    return this.auth.me(req.user.id);
  }

  @Patch('client/:id/password')
  setPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: SetPasswordDto) {
    return this.auth.setPassword(id, dto.password);
  }
}
