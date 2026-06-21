import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('video')
@ApiBearerAuth()
@Controller('video')
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post('token')
  getToken(
    @CurrentUser('id') userId: string,
    @Body() body: { roomId: string; role?: 'host' | 'guest' },
  ) {
    return this.videoService.generateToken(body.roomId, userId, body.role);
  }
}
