/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Achievement` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_key" ON "Achievement"("userId");
