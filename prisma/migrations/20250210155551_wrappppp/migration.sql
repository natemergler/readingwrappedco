/*
  Warnings:

  - Added the required column `averageRating` to the `Wrapper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfBooks` to the `Wrapper` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPages` to the `Wrapper` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Wrapper" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "numberOfBooks" INTEGER NOT NULL,
ADD COLUMN     "totalPages" INTEGER NOT NULL;
