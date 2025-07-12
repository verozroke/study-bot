/*
  Warnings:

  - A unique constraint covering the columns `[telegramId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `telegramId` to the `Admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "telegramId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_telegramId_key" ON "Admin"("telegramId");
