/*
  Warnings:

  - You are about to drop the column `max` on the `Indicator` table. All the data in the column will be lost.
  - You are about to drop the column `min` on the `Indicator` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `Indicator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Indicator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Indicator` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Indicator` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "IndicatorKey" AS ENUM ('ABNT_VALIDATION', 'AI_PERCENTAGE', 'THEORETICAL_FOUNDATION', 'PROBLEM_STATEMENT');

-- CreateEnum
CREATE TYPE "IndicatorType" AS ENUM ('MIN', 'MAX');

-- DropIndex
DROP INDEX "Indicator_title_key";

-- AlterTable
ALTER TABLE "Indicator" DROP COLUMN "max",
DROP COLUMN "min",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "key" "IndicatorKey" NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "IndicatorType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Indicator_key_key" ON "Indicator"("key");
