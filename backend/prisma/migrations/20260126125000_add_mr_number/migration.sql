-- AlterTable
ALTER TABLE "Patient" ADD COLUMN "mrNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Patient_mrNumber_key" ON "Patient"("mrNumber");