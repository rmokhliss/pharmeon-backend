import { Controller, Post, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsString() email: string;
  @IsString() @MinLength(1) password: string;
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

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    return this.auth.adminLogin(dto.username, dto.password);
  }

  @Patch('client/:id/password')
  setPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: SetPasswordDto) {
    return this.auth.setPassword(id, dto.password);
  }
}
