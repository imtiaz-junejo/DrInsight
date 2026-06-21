import { Module } from '@nestjs/common';
import { AiProxyService } from './ai-proxy.service';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiProxyService],
  exports: [AiProxyService],
})
export class AiModule {}
