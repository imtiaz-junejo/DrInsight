import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Public()
  @Post()
  submit(@Body() body: { name: string; email: string; subject?: string; message: string }) {
    return this.contactService.submit(body);
  }

  @Public()
  @Post('newsletter')
  subscribe(@Body('email') email: string) {
    return this.contactService.subscribeNewsletter(email);
  }

  @Get('submissions')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findSubmissions() {
    return this.contactService.findSubmissions();
  }
}
