import { Book, Wrapper, List } from "@prisma/client";
import { prisma } from "~/db.server";

export async function wrapItUp(bookList: Book[], listId: string) {
  const numberOfBooks = bookList.length;
  const totalPages = bookList.reduce((total, book) => total + book.pages, 0);
  const averageRating = bookList.reduce((total, book) => total + book.rating, 0) / numberOfBooks;

  await composeWrapper(bookList, listId);

  return {
    numberOfBooks,
    totalPages,
    averageRating,
  };
}

async function composeWrapper(bookList: Book[], listId: string) {
  const wrapper: Wrapper = {
    id: listId,
    numberOfBooks: bookList.length,
    totalPages: bookList.reduce((total, book) => total + book.pages, 0),
    averageRating: bookList.reduce((total, book) => total + book.rating, 0) / bookList.length,
    url: "/"+listId,
    date: new Date(),
    wrapped: true
  };

  await prisma.wrapper.create({
    data: wrapper,
  });
}

