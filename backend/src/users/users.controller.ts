import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  updateMe(
    @CurrentUser('id') userId: string,
    @Body() body: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(userId, body);
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.usersService.findPending();
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.usersService.setUserStatus(id, status);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
