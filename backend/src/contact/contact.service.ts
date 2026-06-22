import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit(data: { name: string; email: string; subject?: string; message: string }) {
    return this.prisma.contactSubmission.create({ data });
  }

  async subscribeNewsletter(email: string) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true },
      create: { email },
    });
  }
}
