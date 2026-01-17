import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleAuth(@Body() googleUser: any) {
    return this.authService.googleLogin(googleUser);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.authService.validateUser(loginUserDto);
    if (!user) {
      throw new Error('User not found');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.authService.findUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const user = await this.authService.createUser(createUserDto);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  verifyToken(@Request() req) {
    return { valid: true, user: req.user };
  }
}