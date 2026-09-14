-- CreateTable
CREATE TABLE "QueueToken" (
    "id" SERIAL NOT NULL,
    "tokenNumber" INTEGER NOT NULL,
    "department" TEXT NOT NULL DEFAULT 'RECEPTION',
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointmentId" INTEGER,
    "labTestId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QueueToken_appointmentId_key" ON "QueueToken"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "QueueToken_labTestId_key" ON "QueueToken"("labTestId");

-- CreateIndex
CREATE INDEX "QueueToken_date_department_idx" ON "QueueToken"("date", "department");

-- AddForeignKey
ALTER TABLE "QueueToken" ADD CONSTRAINT "QueueToken_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueToken" ADD CONSTRAINT "QueueToken_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES "LabTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
