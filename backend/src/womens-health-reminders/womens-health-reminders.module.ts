import { Module } from '@nestjs/common';
import {
  AdminWomensHealthRemindersController,
  WomensHealthRemindersController,
} from './womens-health-reminders.controller';
import { WomensHealthRemindersService } from './womens-health-reminders.service';

@Module({
  controllers: [WomensHealthRemindersController, AdminWomensHealthRemindersController],
  providers: [WomensHealthRemindersService],
  exports: [WomensHealthRemindersService],
})
export class WomensHealthRemindersModule {}
