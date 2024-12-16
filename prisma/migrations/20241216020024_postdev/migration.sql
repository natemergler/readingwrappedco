-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "wrapped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "goodReadsLink" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "pages" DOUBLE PRECISION NOT NULL,
    "dateRead" TIMESTAMP(3) NOT NULL,
    "average_rating" DOUBLE PRECISION NOT NULL,
    "listId" TEXT NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_listId_fkey" FOREIGN KEY ("listId") REFERENCES "List"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
