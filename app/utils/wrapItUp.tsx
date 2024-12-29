import { Book } from "@prisma/client";

export function wrapItUp(bookList: Book[]) {
  const numberOfBooks = bookList.length;
  const totalPages = bookList.reduce((total, book) => total + book.pages, 0);

  const lowestRatedBook = bookList
  .filter(book => book.rating > 0)
  .reduce((min, book) => book.rating < min.rating ? book : min, bookList[0]);
  const highestRatedBook = bookList
  .filter(book => book.rating > 0)
  .reduce((max, book) => book.rating > max.rating ? book : max, bookList[0]);
  const averageRating = bookList.reduce((total, book) => total + book.rating, 0) / numberOfBooks;

  return {
    numberOfBooks,
    totalPages,
    lowestRatedBook,
    highestRatedBook,
    averageRating,
  };
}

