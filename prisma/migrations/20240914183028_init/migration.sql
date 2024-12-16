-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Book" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "goodReadsLink" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "rating" REAL NOT NULL,
    "pages" REAL NOT NULL,
    "dateRead" DATETIME NOT NULL,
    "average_rating" REAL NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Book_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
