/*
  Warnings:

  - You are about to drop the column `day` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `shiftId` on the `Staff` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Staff" DROP CONSTRAINT "Staff_shiftId_fkey";

-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "day",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "departmentId" INTEGER,
ADD COLUMN     "validFrom" TIMESTAMP(3),
ADD COLUMN     "validTo" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Staff" DROP COLUMN "shiftId";

-- CreateTable
CREATE TABLE "ShiftSlot" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTimeMinutes" INTEGER NOT NULL,
    "durationHours" DOUBLE PRECISION NOT NULL,
    "shiftId" INTEGER NOT NULL,

    CONSTRAINT "ShiftSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffShift" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "overrideStartTimeMinutes" INTEGER,
    "overrideDurationHours" DOUBLE PRECISION,
    "assignedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffShift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DutyRoster" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "staffShiftId" INTEGER,
    "actualStart" TIMESTAMP(3) NOT NULL,
    "actualEnd" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DutyRoster_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSlot" ADD CONSTRAINT "ShiftSlot_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffShift" ADD CONSTRAINT "StaffShift_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffShift" ADD CONSTRAINT "StaffShift_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyRoster" ADD CONSTRAINT "DutyRoster_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DutyRoster" ADD CONSTRAINT "DutyRoster_staffShiftId_fkey" FOREIGN KEY ("staffShiftId") REFERENCES "StaffShift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
