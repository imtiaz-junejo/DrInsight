import { Controller, Get, Patch, Body, Param, Query, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';
import { DeleteAccountDto, UpdateAccountSettingsDto } from './dto/account-settings.dto';

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

  @Patch('me/patient-profile')
  updatePatientProfile(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      dateOfBirth?: string;
      gender?: string;
      bloodGroup?: string;
      allergies?: string[];
      medicalHistory?: string;
      emergencyContact?: string;
    },
  ) {
    return this.usersService.updatePatientProfile(userId, body);
  }

  @Get('me/account-settings')
  getAccountSettings(@CurrentUser('id') userId: string) {
    return this.usersService.getAccountSettings(userId);
  }

  @Patch('me/account-settings')
  updateAccountSettings(@CurrentUser('id') userId: string, @Body() body: UpdateAccountSettingsDto) {
    return this.usersService.updateAccountSettings(userId, body);
  }

  @Delete('me/account')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@CurrentUser('id') userId: string, @Body() body: DeleteAccountDto) {
    return this.usersService.deleteAccount(userId, body.password, body.confirmation);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(
    @Query('role') role?: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ role, page: +page! || 1, limit: +limit! || 20, search });
  }

  @Get('pending')
  @Roles(UserRole.ADMIN)
  findPending() {
    return this.usersService.findPending();
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: UserStatus,
    @CurrentUser() actor: { id: string; firstName: string; lastName: string; role: string },
  ) {
    return this.usersService.setUserStatus(id, status, actor);
  }

  @Get(':id/profile')
  @Roles(UserRole.ADMIN)
  findAdminProfile(@Param('id') id: string) {
    return this.usersService.findAdminProfile(id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
