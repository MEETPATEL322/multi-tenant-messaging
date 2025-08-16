import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  ConflictException,
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth() // Enable JWT Bearer token for all endpoints
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ---------------- Create user (MAIN_ADMIN) ----------------
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MAIN_ADMIN)
  @ApiOperation({ summary: 'Create a new user (Main Admin only)' })
  @ApiBody({ type: CreateUserDto, description: 'User creation payload' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have permission',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    return this.usersService.create(createUserDto);
  }

  // ---------------- Create tenant user (TENANT_ADMIN) ----------------
  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Create a user under tenant (Tenant Admin only)' })
  @ApiBody({
    type: CreateUserTenantDto,
    description: 'Tenant user creation payload',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have permission',
  })
  async createUser(@Body() createUserDto: CreateUserTenantDto, @Req() req) {
    const currentTenantId = req?.user?.tenant_id;
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
    const newUser = await this.usersService.create({
      ...createUserDto,
      tenant_id: currentTenantId,
    });
    return newUser;
  }

  // ---------------- Login ----------------
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto, description: 'Login payload' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  // ---------------- Refresh Token ----------------
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiBody({ type: RefreshDto, description: 'Refresh token payload' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshDto) {
    return this.usersService.refreshToken(refreshTokenDto.refreshToken);
  }

  // ---------------- Find all users (TENANT_ADMIN) ----------------
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'List all users for tenant' })
  @ApiResponse({
    status: 200,
    description: 'Array of users',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden. User does not have permission',
  })
  async findAll(@Req() req) {
    return this.usersService.findAll(req.user.tenant_id, req.query.role);
  }
}
