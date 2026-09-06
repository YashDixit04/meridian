import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@company.com or superadmin' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'SuperSecret123!' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token returned after login' })
  @IsString()
  refreshToken: string;
}
