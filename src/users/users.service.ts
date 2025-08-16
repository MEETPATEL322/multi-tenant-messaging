import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel, // Injects Sequelize model
  ) {}

  // // Create user
  async create(createUserDto: Partial<CreateUserDto>): Promise<User> {
    const passwordHash = await bcrypt.hash(createUserDto.password_hash, 10);
    return await this.userModel.create({
      ...createUserDto,
      password_hash: passwordHash,
    });
  }

  async findByEmail(email: string): Promise<any | null> {
    return await this.userModel.findOne({
      where: { email },
      raw: true,
    });
  }

  private async signTokens(
    user: User & { id?: number },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payloadBase = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    };

    const accessToken = jwt.sign(
      { ...payloadBase, token_type: 'access' },
      process.env.JWT_ACCESS_SECRET ?? 'accessSecret',
      { expiresIn: ACCESS_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { ...payloadBase, token_type: 'refresh' },
      process.env.JWT_REFRESH_SECRET ?? 'refreshSecret',
      { expiresIn: REFRESH_EXPIRES },
    );

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await User.findOne({ where: { email: dto.email }, raw: true });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.signTokens(user);

    const updatedUser = await this.userModel.update(
      {
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      },
      {
        where: { email: dto.email },
      },
    );
    return {
      ...user,
      tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload: any = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'refreshSecret',
      );
      console.log(payload, 'payload');
      if (!payload?.email) {
        throw new UnauthorizedException('Invalid refresh token payload');
      }
      const user = await User.findOne({
        where: { email: payload.email },
        raw: true,
      });
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const payloadBase = {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id,
      };

      const accessToken = jwt.sign(
        { ...payloadBase, token_type: 'access' },
        process.env.JWT_ACCESS_SECRET ?? 'accessSecret',
        { expiresIn: ACCESS_EXPIRES },
      );

      const updatedUser = await this.userModel.update(
        {
          access_token: accessToken,
        },
        {
          where: { email: payload.email },
        },
      );

      return { accessToken: accessToken };
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
