import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/enums/role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const usersService = app.get(UsersService);

  const email = 'admin@example.com';
  const password = 'Admin@123';

  // Check if admin already exists
  const existingUser = await usersService.findByEmail(email);
  if (existingUser) {
    console.log(`⚠️ Admin user already exists with email: ${email}`);
    await app.close();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await usersService.create({
    email,
    password_hash: passwordHash,
    role: UserRole.MAIN_ADMIN,
  });

  console.log(`✅ Admin user created: ${email}`);
  await app.close();
}

bootstrap();
