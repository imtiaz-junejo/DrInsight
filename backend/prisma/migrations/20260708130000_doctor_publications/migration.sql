-- CreateTable
CREATE TABLE "doctor_publications" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "publicationYear" INTEGER NOT NULL,
    "doi" TEXT,
    "url" TEXT,
    "abstract" TEXT,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "authors" TEXT,
    "publisher" TEXT,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_publications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_publications_doctorId_idx" ON "doctor_publications"("doctorId");

-- CreateIndex
CREATE INDEX "doctor_publications_publicationYear_idx" ON "doctor_publications"("publicationYear");

-- AddForeignKey
ALTER TABLE "doctor_publications" ADD CONSTRAINT "doctor_publications_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
