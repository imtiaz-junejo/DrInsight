-- AlterTable
ALTER TABLE "meeting_chats" ADD COLUMN "replyToId" TEXT;

-- CreateIndex
CREATE INDEX "meeting_chats_replyToId_idx" ON "meeting_chats"("replyToId");

-- AddForeignKey
ALTER TABLE "meeting_chats" ADD CONSTRAINT "meeting_chats_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "meeting_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
