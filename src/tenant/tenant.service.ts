import { Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Tenant } from './tenant.model';

@Injectable()
export class TenantService {
  constructor(
    @InjectModel(Tenant) private readonly tenantModel, // Injects Sequelize model
  ) {}

  async create(createTenantDto: Partial<CreateTenantDto>): Promise<Tenant> {
    return await this.tenantModel.create(createTenantDto);
  }
  async findById(id: string): Promise<any> {
    return await this.tenantModel.findByPk(id, { raw: true });
  }
}
