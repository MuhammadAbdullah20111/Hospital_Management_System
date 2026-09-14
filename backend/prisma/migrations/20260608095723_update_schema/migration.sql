-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "LabTest" ADD COLUMN     "createdById" INTEGER;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "createdById" INTEGER;

-- CreateIndex
CREATE INDEX "Appointment_createdById_idx" ON "Appointment"("createdById");

-- CreateIndex
CREATE INDEX "Appointment_createdAt_idx" ON "Appointment"("createdAt");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "LabTest_createdById_idx" ON "LabTest"("createdById");

-- CreateIndex
CREATE INDEX "LabTest_createdAt_idx" ON "LabTest"("createdAt");

-- CreateIndex
CREATE INDEX "Patient_createdById_idx" ON "Patient"("createdById");

-- CreateIndex
CREATE INDEX "Patient_createdAt_idx" ON "Patient"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTest" ADD CONSTRAINT "LabTest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
