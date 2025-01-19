/*
  Warnings:

  - Added the required column `thumbnail` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "isbn" TEXT,
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ADD COLUMN     "wrapperId" TEXT;

-- CreateTable
CREATE TABLE "Wrapper" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "wrapped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Wrapper_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_wrapperId_fkey" FOREIGN KEY ("wrapperId") REFERENCES "Wrapper"("id") ON DELETE SET NULL ON UPDATE CASCADE;
