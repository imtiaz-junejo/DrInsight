import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  getConversations(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    return this.chatService.getConversations(userId, role);
  }

  @Post('conversations')
  createConversation(
    @CurrentUser('id') userId: string,
    @Body('doctorId') doctorId: string,
  ) {
    return this.chatService.getOrCreateConversation(userId, doctorId);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.chatService.getMessages(id, userId, +page! || 1, +limit! || 50);
  }

  @Post('conversations/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { content: string; type?: string; attachmentUrl?: string },
  ) {
    return this.chatService.sendMessage(userId, id, body.content, body.type as never, body.attachmentUrl);
  }

  @Post('conversations/:id/read')
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.chatService.markAsRead(id, userId);
  }
}
