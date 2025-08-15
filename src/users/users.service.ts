import { Injectable, Inject } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel, // Injects Sequelize model
  ) {}

  // // Create user
  async create(createUserDto: Partial<CreateUserDto>): Promise<User> {
    return await this.userModel.create(createUserDto);
  }

  async findByEmail(email: string): Promise<any | null> {
    return await this.userModel.findOne({
      where: { email },
      raw: true,
    });
  }
}
