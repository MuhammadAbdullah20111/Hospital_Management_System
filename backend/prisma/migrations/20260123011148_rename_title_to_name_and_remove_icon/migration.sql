/*
  Warnings:

  - You are about to drop the column `icon` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Service` table. All the data in the column will be lost.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "icon",
DROP COLUMN "title",
ADD COLUMN     "name" TEXT NOT NULL;
