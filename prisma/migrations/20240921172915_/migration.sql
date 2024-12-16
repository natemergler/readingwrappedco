/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `Book` table. All the data in the column will be lost.
  - Added the required column `author` to the `Book` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listId` to the `Book` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "goodReadsLink" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "pages" REAL NOT NULL,
    "dateRead" DATETIME NOT NULL,
    "average_rating" REAL NOT NULL,
    "listId" TEXT NOT NULL,
    CONSTRAINT "Book_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("average_rating", "coverImage", "dateRead", "goodReadsLink", "id", "pages", "rating", "title") SELECT "average_rating", "coverImage", "dateRead", "goodReadsLink", "id", "pages", "rating", "title" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
