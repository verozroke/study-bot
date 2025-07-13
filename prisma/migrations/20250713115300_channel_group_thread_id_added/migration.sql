/*
  Warnings:

  - Added the required column `groupId` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `messageThreadId` to the `Channel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "groupId" BIGINT NOT NULL,
ADD COLUMN     "messageThreadId" INTEGER NOT NULL;
