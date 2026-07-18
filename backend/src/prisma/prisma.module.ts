import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProfileNumberService } from './profile-number.service';

@Global()
@Module({
  providers: [PrismaService, ProfileNumberService],
  exports: [PrismaService, ProfileNumberService],
})
export class PrismaModule {}
