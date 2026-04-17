import { Controller, Post, Body, Patch, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsString, MinLength } from 'class-validator';

class LoginDto {
  @IsEmail() email: string;
  @IsString() @MinLength(4) password: string;
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

  @Patch('client/:id/password')
  setPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: SetPasswordDto) {
    return this.auth.setPassword(id, dto.password);
  }
}
