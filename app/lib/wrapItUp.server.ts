import { Book, Wrapper, List } from "@prisma/client";
import { prisma } from "~/db.server";

export async function wrapItUp(
  bookList: Book[],
  listId: string
): Promise<string> {
  return await composeWrapper(bookList, listId);
}

async function composeWrapper(
  bookList: Book[],
  listId: string
): Promise<string> {
  const wrapper: Wrapper = {
    id: listId,
    numberOfBooks: bookList.length,
    totalPages: bookList.reduce((total, book) => total + book.pages, 0),
    averageRating:
      bookList.reduce((total, book) => total + book.rating, 0) /
      bookList.length,
    url: "/" + listId,
    date: new Date(),
    wrapped: true,
  };
  try {
    await prisma.wrapper.create({
      data: {
        ...wrapper,
        books: {
          connect: bookList.map((book) => ({ id: book.id })),
        },
      },
    });
    await prisma.list.update({where: {id: listId}, data: {wrapped: true}});
  } catch (e) {
    console.error("Error in composeWrapper:", e);
    return "/";
  }

  return listId;
}
