import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
} from 'sequelize-typescript';
import { UserRole } from 'src/enums/role.enum';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.STRING(24),
    allowNull: true,
  })
  tenant_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password_hash: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
  })
  role: UserRole;

  // Store tokens
  @AllowNull(true)
  @Column(DataType.TEXT)
  access_token: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  refresh_token: string;
}
