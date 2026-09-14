/*
  Warnings:

  - A unique constraint covering the columns `[biometricPin]` on the table `Staff` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "biometricPin" TEXT;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BiometricDevice" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 4370,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastSyncAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BiometricDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceRecord" (
    "id" SERIAL NOT NULL,
    "deviceUserPin" TEXT NOT NULL,
    "staffId" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "verifyMode" INTEGER NOT NULL DEFAULT 0,
    "deviceUid" TEXT NOT NULL,
    "biometricDeviceId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAttendanceSummary" (
    "id" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ABSENT',
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "isManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyAttendanceSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BiometricDevice_ipAddress_key" ON "BiometricDevice"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceRecord_deviceUid_key" ON "AttendanceRecord"("deviceUid");

-- CreateIndex
CREATE INDEX "AttendanceRecord_staffId_idx" ON "AttendanceRecord"("staffId");

-- CreateIndex
CREATE INDEX "AttendanceRecord_timestamp_idx" ON "AttendanceRecord"("timestamp");

-- CreateIndex
CREATE INDEX "AttendanceRecord_deviceUserPin_idx" ON "AttendanceRecord"("deviceUserPin");

-- CreateIndex
CREATE INDEX "AttendanceRecord_deviceUid_idx" ON "AttendanceRecord"("deviceUid");

-- CreateIndex
CREATE INDEX "DailyAttendanceSummary_staffId_idx" ON "DailyAttendanceSummary"("staffId");

-- CreateIndex
CREATE INDEX "DailyAttendanceSummary_date_idx" ON "DailyAttendanceSummary"("date");

-- CreateIndex
CREATE INDEX "DailyAttendanceSummary_status_idx" ON "DailyAttendanceSummary"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAttendanceSummary_staffId_date_key" ON "DailyAttendanceSummary"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_biometricPin_key" ON "Staff"("biometricPin");

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_biometricDeviceId_fkey" FOREIGN KEY ("biometricDeviceId") REFERENCES "BiometricDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyAttendanceSummary" ADD CONSTRAINT "DailyAttendanceSummary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
