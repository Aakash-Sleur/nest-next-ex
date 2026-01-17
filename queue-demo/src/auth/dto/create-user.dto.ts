export class CreateUserDto {
  email: string;
  name: string;
  googleId?: string;
  avatar?: string;
  emailVerified?: boolean;
  provider?: string;
}