/*
  Warnings:

  - You are about to drop the column `dateRead` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `listId` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `wrapperId` on the `Book` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_listId_fkey";

-- DropForeignKey
ALTER TABLE "Book" DROP CONSTRAINT "Book_wrapperId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "dateRead",
DROP COLUMN "listId",
DROP COLUMN "rating",
DROP COLUMN "wrapperId";

-- CreateTable
CREATE TABLE "ListBook" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "listId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "dateRead" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WrapperBook" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "wrapperId" TEXT NOT NULL,

    CONSTRAINT "WrapperBook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListBook_bookId_listId_key" ON "ListBook"("bookId", "listId");

-- CreateIndex
CREATE UNIQUE INDEX "WrapperBook_bookId_wrapperId_key" ON "WrapperBook"("bookId", "wrapperId");

-- AddForeignKey
ALTER TABLE "ListBook" ADD CONSTRAINT "ListBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListBook" ADD CONSTRAINT "ListBook_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrapperBook" ADD CONSTRAINT "WrapperBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WrapperBook" ADD CONSTRAINT "WrapperBook_wrapperId_fkey" FOREIGN KEY ("wrapperId") REFERENCES "Wrapper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
