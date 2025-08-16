import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  CreateUserTenantDto,
  LoginDto,
  RefreshDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/guard/roles.decorator';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MAIN_ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.usersService.create(createUserDto);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  async createUser(@Body() createUserDto: CreateUserTenantDto, @Req() req) {
    const currentTenantId = req?.user?.tenant_id;

    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Override tenantId from authenticated user
    const newUser = await this.usersService.create({
      ...createUserDto,
      tenant_id: currentTenantId,
    });

    return newUser;
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshDto) {
    return this.usersService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  async findAll(@Req() req) {
    return this.usersService.findAll(req.user.tenant_id, req.query.role);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.usersService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
