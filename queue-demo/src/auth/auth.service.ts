import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createSupabaseClient } from '../config/supabase.config';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    // private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.supabase = createSupabaseClient(configService);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          email: createUserDto.email,
          name: createUserDto.name,
          google_id: createUserDto.googleId,
          avatar: createUserDto.avatar,
          email_verified: createUserDto.emailVerified || true, // Google emails are verified
          provider: createUserDto.provider || 'google',
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User | null> {
    let user: User | null = null;

    if (loginUserDto.googleId) {
      user = await this.findUserByGoogleId(loginUserDto.googleId);
    } else {
      user = await this.findUserByEmail(loginUserDto.email);
    }

    return user;
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      name: user.name 
    };

    return {
      // access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async googleLogin(googleUser: any) {
    // Check if user exists by Google ID
    let user = await this.findUserByGoogleId(googleUser.id);
    
    if (!user) {
      // Check if user exists by email
      user = await this.findUserByEmail(googleUser.email);
      
      if (user) {
        // Update existing user with Google ID
        const { data, error } = await this.supabase
          .from('users')
          .update({ google_id: googleUser.id })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update user: ${error.message}`);
        }
        user = data;
      } else {
        // Create new user
        user = await this.createUser({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          avatar: googleUser.picture,
          emailVerified: true,
          provider: 'google',
        });
      }
    }

    if (!user) {
      throw new Error('Failed to create or find user');
    }

    return this.login(user);
  }

  // async validateToken(token: string): Promise<User | null> {
  //   try {
  //     const payload = this.jwtService.verify(token);
  //     const user = await this.findUserByEmail(payload.email);
  //     return user;
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }
}