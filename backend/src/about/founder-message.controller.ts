import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { UpsertFounderMessageDto } from './dto/founder-message.dto';
import { FounderMessageService } from './founder-message.service';

@ApiTags('about')
@Controller('about/founder')
export class FounderMessageController {
  constructor(private founderMessageService: FounderMessageService) {}

  @Public()
  @Get()
  findPublic() {
    return this.founderMessageService.findPublic();
  }

  @Get('manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAdmin() {
    return this.founderMessageService.findAdmin();
  }

  @Put()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  upsert(@Body() body: UpsertFounderMessageDto) {
    return this.founderMessageService.upsert(body);
  }
}
