import {
  Table,
  Column,
  Model,
  DataType,
} from 'sequelize-typescript';

@Table({
  tableName: 'tenants',
  timestamps: true,
})
export class Tenant extends Model<Tenant> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
  
}
