import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import {
  CreateTrustedPartnerDto,
  ReorderTrustedPartnersDto,
  UpdatePartnerStatusDto,
  UpdateTrustedPartnerDto,
} from './dto/trusted-partner.dto';
import { TrustedPartnersService } from './trusted-partners.service';

@ApiTags('about')
@Controller('about/partners')
export class TrustedPartnersController {
  constructor(private trustedPartnersService: TrustedPartnersService) {}

  @Public()
  @Get()
  findPublic() {
    return this.trustedPartnersService.findPublic();
  }

  @Get('manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'all' | 'active' | 'inactive',
  ) {
    return this.trustedPartnersService.findAllAdmin({
      page: +page! || 1,
      limit: +limit! || 12,
      search,
      status: status || 'all',
    });
  }

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  create(@Body() body: CreateTrustedPartnerDto) {
    return this.trustedPartnersService.create(body);
  }

  @Patch('reorder')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  reorder(@Body() body: ReorderTrustedPartnersDto) {
    return this.trustedPartnersService.reorder(body);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  setStatus(@Param('id') id: string, @Body() body: UpdatePartnerStatusDto) {
    return this.trustedPartnersService.setStatus(id, body.isActive);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() body: UpdateTrustedPartnerDto) {
    return this.trustedPartnersService.update(id, body);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.trustedPartnersService.remove(id);
  }
}
