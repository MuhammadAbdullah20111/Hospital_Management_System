/*
  Warnings:

  - You are about to drop the column `status` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `services` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[labTestId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "LabTest" ADD COLUMN     "expectedDate" TIMESTAMP(3),
ADD COLUMN     "reportFile" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "status",
ADD COLUMN     "labTestId" INTEGER;

-- AlterTable
ALTER TABLE "services" DROP COLUMN "duration";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_labTestId_key" ON "Payment"("labTestId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
