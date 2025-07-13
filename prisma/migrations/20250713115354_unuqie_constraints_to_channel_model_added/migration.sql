/*
  Warnings:

  - A unique constraint covering the columns `[groupId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[messageThreadId]` on the table `Channel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Channel_groupId_key" ON "Channel"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_messageThreadId_key" ON "Channel"("messageThreadId");
