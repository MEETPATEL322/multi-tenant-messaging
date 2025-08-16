import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Tenant } from './tenant.model';

@Module({
  controllers: [TenantController],
  providers: [TenantService],
  imports: [SequelizeModule.forFeature([Tenant])],
  exports: [SequelizeModule],
})
export class TenantModule {}
