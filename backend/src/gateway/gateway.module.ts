import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RealtimeGateway } from './realtime.gateway';
import { ChatModule } from '../chat/chat.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [JwtModule, ConfigModule, ChatModule, UsersModule],
  providers: [RealtimeGateway],
})
export class GatewayModule {}
