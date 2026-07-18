-- Telemedicine consultation system

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('WAITING', 'LIVE', 'ENDED', 'MISSED', 'CANCELLED');
CREATE TYPE "MeetingParticipantRole" AS ENUM ('DOCTOR', 'PATIENT', 'OBSERVER');
CREATE TYPE "MeetingEventType" AS ENUM ('CONSULTATION_STARTED', 'CONSULTATION_ENDED', 'PARTICIPANT_JOINED', 'PARTICIPANT_LEFT', 'CAMERA_TOGGLED', 'MIC_TOGGLED', 'SCREEN_SHARE_STARTED', 'SCREEN_SHARE_STOPPED', 'CONNECTION_LOST', 'CONNECTION_RESTORED', 'ICE_RESTART', 'CHAT_MESSAGE', 'PRESCRIPTION_ISSUED', 'LAB_ORDER_CREATED', 'NOTE_SAVED');
CREATE TYPE "CallLogAction" AS ENUM ('START', 'JOIN', 'LEAVE', 'END', 'RECONNECT', 'ERROR', 'ICE_FAILURE', 'TURN_FAILURE');
CREATE TYPE "ConnectionLogState" AS ENUM ('CONNECTING', 'CONNECTED', 'DISCONNECTED', 'FAILED', 'RECONNECTING');
CREATE TYPE "NetworkQuality" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DISCONNECTED');
CREATE TYPE "MeetingAuditAction" AS ENUM ('MEETING_CREATED', 'MEETING_STARTED', 'MEETING_ENDED', 'PARTICIPANT_JOINED', 'PARTICIPANT_LEFT', 'ACCESS_DENIED', 'CHAT_SENT', 'PRESCRIPTION_ISSUED', 'LAB_ORDER_CREATED', 'RECORDING_STARTED', 'RECORDING_STOPPED', 'ERROR');
CREATE TYPE "RecordingStatus" AS ENUM ('PENDING', 'RECORDING', 'COMPLETED', 'FAILED');
CREATE TYPE "LabOrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');
CREATE TYPE "LabOrderStatus" AS ENUM ('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CONSULTATION';
ALTER TYPE "NotificationType" ADD VALUE 'LAB_ORDER';

-- AlterTable appointments
ALTER TABLE "appointments" ADD COLUMN "roomId" TEXT;
ALTER TABLE "appointments" ADD COLUMN "meetingStatus" "MeetingStatus" NOT NULL DEFAULT 'WAITING';
ALTER TABLE "appointments" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "appointments" ADD COLUMN "endedAt" TIMESTAMP(3);
ALTER TABLE "appointments" ADD COLUMN "durationSeconds" INTEGER;
ALTER TABLE "appointments" ADD COLUMN "doctorJoinedAt" TIMESTAMP(3);
ALTER TABLE "appointments" ADD COLUMN "patientJoinedAt" TIMESTAMP(3);

-- Backfill roomId from meetingRoomId
UPDATE "appointments" SET "roomId" = "meetingRoomId" WHERE "meetingRoomId" IS NOT NULL AND "roomId" IS NULL;

CREATE INDEX "appointments_meetingStatus_idx" ON "appointments"("meetingStatus");
CREATE INDEX "appointments_roomId_idx" ON "appointments"("roomId");
CREATE INDEX "appointments_meetingRoomId_idx" ON "appointments"("meetingRoomId");

-- CreateTable meetings
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'WAITING',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_participants" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MeetingParticipantRole" NOT NULL,
    "socketId" TEXT,
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "isConnected" BOOLEAN NOT NULL DEFAULT false,
    "cameraEnabled" BOOLEAN NOT NULL DEFAULT true,
    "micEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_events" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "MeetingEventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meeting_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "action" "CallLogAction" NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "connection_logs" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT,
    "state" "ConnectionLogState" NOT NULL,
    "iceState" TEXT,
    "signalingState" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "connection_logs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "device_info" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "browser" TEXT,
    "os" TEXT,
    "deviceType" TEXT,
    "cameraLabel" TEXT,
    "microphoneLabel" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "device_info_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "network_stats" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "quality" "NetworkQuality" NOT NULL,
    "packetLoss" DOUBLE PRECISION,
    "latencyMs" DOUBLE PRECISION,
    "bitrateKbps" DOUBLE PRECISION,
    "roundTripMs" DOUBLE PRECISION,
    "jitterMs" DOUBLE PRECISION,
    "rawStats" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "network_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_chats" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "seenAt" TIMESTAMP(3),
    "seenById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "meeting_chats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_attachments" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "uploaderId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meeting_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_audits" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "MeetingAuditAction" NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "meeting_audits_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "meeting_recordings" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "storageUrl" TEXT,
    "status" "RecordingStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "meeting_recordings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lab_orders" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "tests" JSONB NOT NULL,
    "instructions" TEXT,
    "priority" "LabOrderPriority" NOT NULL DEFAULT 'ROUTINE',
    "status" "LabOrderStatus" NOT NULL DEFAULT 'ORDERED',
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lab_orders_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "meetings_appointmentId_key" ON "meetings"("appointmentId");
CREATE UNIQUE INDEX "meetings_roomId_key" ON "meetings"("roomId");
CREATE INDEX "meetings_status_idx" ON "meetings"("status");
CREATE INDEX "meetings_roomId_idx" ON "meetings"("roomId");
CREATE INDEX "meetings_startedAt_idx" ON "meetings"("startedAt");

CREATE UNIQUE INDEX "meeting_participants_meetingId_userId_key" ON "meeting_participants"("meetingId", "userId");
CREATE INDEX "meeting_participants_meetingId_idx" ON "meeting_participants"("meetingId");
CREATE INDEX "meeting_participants_userId_idx" ON "meeting_participants"("userId");

CREATE INDEX "meeting_events_meetingId_idx" ON "meeting_events"("meetingId");
CREATE INDEX "meeting_events_eventType_idx" ON "meeting_events"("eventType");
CREATE INDEX "meeting_events_createdAt_idx" ON "meeting_events"("createdAt");

CREATE INDEX "call_logs_meetingId_idx" ON "call_logs"("meetingId");
CREATE INDEX "call_logs_userId_idx" ON "call_logs"("userId");
CREATE INDEX "call_logs_action_idx" ON "call_logs"("action");
CREATE INDEX "call_logs_createdAt_idx" ON "call_logs"("createdAt");

CREATE INDEX "connection_logs_meetingId_idx" ON "connection_logs"("meetingId");
CREATE INDEX "connection_logs_userId_idx" ON "connection_logs"("userId");
CREATE INDEX "connection_logs_state_idx" ON "connection_logs"("state");
CREATE INDEX "connection_logs_createdAt_idx" ON "connection_logs"("createdAt");

CREATE UNIQUE INDEX "device_info_participantId_key" ON "device_info"("participantId");

CREATE INDEX "network_stats_participantId_idx" ON "network_stats"("participantId");
CREATE INDEX "network_stats_quality_idx" ON "network_stats"("quality");
CREATE INDEX "network_stats_createdAt_idx" ON "network_stats"("createdAt");

CREATE INDEX "meeting_chats_meetingId_idx" ON "meeting_chats"("meetingId");
CREATE INDEX "meeting_chats_senderId_idx" ON "meeting_chats"("senderId");
CREATE INDEX "meeting_chats_createdAt_idx" ON "meeting_chats"("createdAt");

CREATE INDEX "meeting_attachments_meetingId_idx" ON "meeting_attachments"("meetingId");
CREATE INDEX "meeting_attachments_uploaderId_idx" ON "meeting_attachments"("uploaderId");

CREATE INDEX "meeting_audits_meetingId_idx" ON "meeting_audits"("meetingId");
CREATE INDEX "meeting_audits_actorId_idx" ON "meeting_audits"("actorId");
CREATE INDEX "meeting_audits_action_idx" ON "meeting_audits"("action");
CREATE INDEX "meeting_audits_createdAt_idx" ON "meeting_audits"("createdAt");

CREATE INDEX "meeting_recordings_meetingId_idx" ON "meeting_recordings"("meetingId");
CREATE INDEX "meeting_recordings_status_idx" ON "meeting_recordings"("status");

CREATE INDEX "lab_orders_appointmentId_idx" ON "lab_orders"("appointmentId");
CREATE INDEX "lab_orders_doctorId_idx" ON "lab_orders"("doctorId");
CREATE INDEX "lab_orders_patientId_idx" ON "lab_orders"("patientId");
CREATE INDEX "lab_orders_status_idx" ON "lab_orders"("status");

-- Foreign keys
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_participants" ADD CONSTRAINT "meeting_participants_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_events" ADD CONSTRAINT "meeting_events_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "connection_logs" ADD CONSTRAINT "connection_logs_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "device_info" ADD CONSTRAINT "device_info_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "meeting_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "network_stats" ADD CONSTRAINT "network_stats_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "meeting_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_chats" ADD CONSTRAINT "meeting_chats_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_attachments" ADD CONSTRAINT "meeting_attachments_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_audits" ADD CONSTRAINT "meeting_audits_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meeting_recordings" ADD CONSTRAINT "meeting_recordings_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "lab_orders" ADD CONSTRAINT "lab_orders_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patient_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
