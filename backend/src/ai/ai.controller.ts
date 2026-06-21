import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiProxyService } from './ai-proxy.service';
import { Public } from '../common/decorators/auth.decorators';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiProxyService) {}

  @Public()
  @Post('symptom-checker')
  symptomCheck(@Body() body: unknown) {
    return this.aiService.symptomCheck(body);
  }

  @Public()
  @Post('medical-chat')
  medicalChat(@Body() body: unknown) {
    return this.aiService.medicalChat(body);
  }

  @Post('report-summarize')
  @ApiBearerAuth()
  summarizeReport(@Body() body: unknown) {
    return this.aiService.summarizeReport(body);
  }

  @Public()
  @Post('doctor-recommendation')
  recommendDoctors(@Body() body: unknown) {
    return this.aiService.recommendDoctors(body);
  }
}
