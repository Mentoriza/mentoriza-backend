/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Indicator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Indicator_title_key" ON "Indicator"("title");
