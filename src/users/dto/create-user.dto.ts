import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: '1', description: 'Tenant ID the user belongs to' })
  @IsNotEmpty()
  @IsString()
  tenant_id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password_hash: string;

  @ApiProperty({ enum: UserRole, example: UserRole.TENANT_ADMIN, description: 'Role of the user' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'strongpassword', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshDto {
  @ApiProperty({ example: 'refresh-token-jwt', description: 'JWT refresh token' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class CreateUserTenantDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password_hash: string;

  @ApiProperty({
    enum: [UserRole.AGENT, UserRole.AUDITOR, UserRole.MANAGER],
    example: UserRole.AGENT,
    description: 'Role of the tenant user (AGENT, AUDITOR, MANAGER)',
  })
  @IsNotEmpty()
  @IsEnum([UserRole.AGENT, UserRole.AUDITOR, UserRole.MANAGER], {
    message: 'Role must be one of AGENT, AUDITOR, MANAGER',
  })
  role: UserRole;
}
