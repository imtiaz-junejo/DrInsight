import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConnectionLogState, LabOrderPriority, NetworkQuality } from '@prisma/client';

export class StartConsultationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;
}

export class JoinMeetingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  deviceInfo?: {
    browser?: string;
    os?: string;
    deviceType?: string;
    cameraLabel?: string;
    microphoneLabel?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
}

export class EndConsultationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;
}

export class MeetingChatDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  content!: string;
}

export class MarkChatSeenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  messageId!: string;
}

export class NetworkQualityDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  packetLoss?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  latencyMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bitrateKbps?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  roundTripMs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  jitterMs?: number;
}

export class ConnectionLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty({ enum: ConnectionLogState })
  @IsEnum(ConnectionLogState)
  state!: ConnectionLogState;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iceState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  signalingState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  errorCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class CreateLabOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty({ type: [Object] })
  @IsArray()
  tests!: Array<{ name: string; code?: string; notes?: string }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  instructions?: string;

  @ApiPropertyOptional({ enum: LabOrderPriority })
  @IsOptional()
  @IsEnum(LabOrderPriority)
  priority?: LabOrderPriority;
}

export class AutosaveNoteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  noteId?: string;
}

export class MeetingHistoryQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
