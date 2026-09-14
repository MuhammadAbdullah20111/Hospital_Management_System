-- DropForeignKey
ALTER TABLE "Bed" DROP CONSTRAINT "Bed_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Bed" DROP CONSTRAINT "Bed_wardId_fkey";

-- DropForeignKey
ALTER TABLE "BedAssignment" DROP CONSTRAINT "BedAssignment_bedId_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_wardId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BedAssignment" ADD CONSTRAINT "BedAssignment_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
