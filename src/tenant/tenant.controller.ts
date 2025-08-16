import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/enums/role.enum';
import { Roles } from 'src/guard/roles.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Tenants') // Group endpoints under "Tenants"
@ApiBearerAuth() // Indicates JWT auth is required
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MAIN_ADMIN)
  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiBody({ type: CreateTenantDto, description: 'Tenant creation payload' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have permission',
  })
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get tenant by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Tenant details returned successfully.',
  })
  @ApiResponse({ status: 404, description: 'Tenant not found.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findOne(@Param('id') id: string) {
    const tenant = await this.tenantService.findById(id);

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }

    return tenant;
  }
}
