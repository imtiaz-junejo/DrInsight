-- CreateTable
CREATE TABLE "trusted_partners" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trusted_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founder_messages" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "founderName" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "imageUrl" TEXT,
    "headline" TEXT NOT NULL,
    "messageHtml" TEXT NOT NULL,
    "signatureImageUrl" TEXT,
    "videoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "eyebrow" TEXT,
    "subline" TEXT,
    "badgeText" TEXT,
    "credentials" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "signatureName" TEXT,
    "signatureTitle" TEXT,
    "locationLine" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founder_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trusted_partners_isActive_displayOrder_idx" ON "trusted_partners"("isActive", "displayOrder");
