import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { BlogModule } from './blog/blog.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { StorageModule } from './storage/storage.module';
import { VideoModule } from './video/video.module';
import { AiModule } from './ai/ai.module';
import { RedisModule } from './redis/redis.module';
import { GatewayModule } from './gateway/gateway.module';
import { PaymentsModule } from './payments/payments.module';
import { AboutModule } from './about/about.module';
import { AskDoctorModule } from './ask-doctor/ask-doctor.module';
import { CommunicationModule } from './communication/communication.module';
import { PlatformModule } from './platform/platform.module';
import { PublicationsModule } from './publications/publications.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    DoctorsModule,
    AppointmentsModule,
    BlogModule,
    ChatModule,
    NotificationsModule,
    ReviewsModule,
    PrescriptionsModule,
    StorageModule,
    VideoModule,
    PaymentsModule,
    AboutModule,
    AskDoctorModule,
    CommunicationModule,
    PlatformModule,
    PublicationsModule,
    AiModule,
    GatewayModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule {}
