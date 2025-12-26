import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/user.repository';
import { UserPrismaRepository } from './prisma/user.prisma-repository';
import { AdminUsersController } from './presentation/admin-users.controller';

@Module({
  controllers: [AdminUsersController],
  providers: [
    UsersService,
    { provide: UserRepository, useClass: UserPrismaRepository }
  ],
  exports: [UsersService, UserRepository]
})
export class UsersModule {}
