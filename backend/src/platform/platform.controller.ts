import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/auth.decorators';
import { PlatformService } from './platform.service';

@ApiTags('platform')
@Controller('platform')
export class PlatformController {
  constructor(private platformService: PlatformService) {}

  @Public()
  @Get('stats')
  getStats() {
    return this.platformService.getPublicStats();
  }
}
