import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'TenantName', description: 'Name of the tenant' })
  @IsNotEmpty()
  @IsString()
  name: string;
}
