/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `validFrom` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `validTo` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `ShiftSlot` table. All the data in the column will be lost.
  - You are about to drop the column `durationHours` on the `ShiftSlot` table. All the data in the column will be lost.
  - You are about to drop the column `startTimeMinutes` on the `ShiftSlot` table. All the data in the column will be lost.
  - You are about to drop the column `assignedBy` on the `StaffShift` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `StaffShift` table. All the data in the column will be lost.
  - You are about to drop the column `overrideDurationHours` on the `StaffShift` table. All the data in the column will be lost.
  - You are about to drop the column `overrideStartTimeMinutes` on the `StaffShift` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `StaffShift` table. All the data in the column will be lost.
  - You are about to drop the `DutyRoster` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `duration` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDayOfWeek` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDayOfWeek` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DutyRoster" DROP CONSTRAINT "DutyRoster_staffId_fkey";

-- DropForeignKey
ALTER TABLE "DutyRoster" DROP CONSTRAINT "DutyRoster_staffShiftId_fkey";

-- AlterTable
ALTER TABLE "Shift" DROP COLUMN "createdBy",
DROP COLUMN "validFrom",
DROP COLUMN "validTo";

-- AlterTable
ALTER TABLE "ShiftSlot" DROP COLUMN "dayOfWeek",
DROP COLUMN "durationHours",
DROP COLUMN "startTimeMinutes",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "endDayOfWeek" TEXT NOT NULL,
ADD COLUMN     "endTime" TEXT NOT NULL,
ADD COLUMN     "startDayOfWeek" TEXT NOT NULL,
ADD COLUMN     "startTime" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StaffShift" DROP COLUMN "assignedBy",
DROP COLUMN "endDate",
DROP COLUMN "overrideDurationHours",
DROP COLUMN "overrideStartTimeMinutes",
DROP COLUMN "startDate";

-- DropTable
DROP TABLE "DutyRoster";
