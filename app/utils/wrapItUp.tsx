import { List, Book } from "@prisma/client";

type AuthorCount = Record<string, number>;


export function wrapItUp(bookList: Book[]) {
  const numberOfBooks = bookList.length;
  const totalPages = bookList.reduce((total, book) => total + book.pages, 0);

  const favoriteAuthors: Record<string, number> = bookList.reduce((authorCount, book) => {
    authorCount[book.author] = (authorCount[book.author] || 0) + 1;
    return authorCount;
  }, {} as Record<string, number>);

  const topFavoriteAuthors = Object.entries(favoriteAuthors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([author, count]) => ({ author, count }));

  const booksByTopFavoriteAuthors = topFavoriteAuthors.map(author => ({
    author: author.author,
    book: bookList.find(book => book.author === author.author)
  }));

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
    topFavoriteAuthors: booksByTopFavoriteAuthors,
    lowestRatedBook,
    highestRatedBook,
    averageRating,
  };
}

