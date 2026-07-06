import { Module } from '@nestjs/common';
import { FounderMessageController } from './founder-message.controller';
import { FounderMessageService } from './founder-message.service';
import { TrustedPartnersController } from './trusted-partners.controller';
import { TrustedPartnersService } from './trusted-partners.service';

@Module({
  controllers: [TrustedPartnersController, FounderMessageController],
  providers: [TrustedPartnersService, FounderMessageService],
})
export class AboutModule {}
