import { Book, Wrapper, List, ListBook } from "@prisma/client";
import { prisma } from "~/db.server";

export async function wrapItUp(
  listId: string
): Promise<string> {
  // Get all books for this list with their book data
  const listBooks = await prisma.listBook.findMany({
    where: { listId },
    include: { book: true }
  });
  
  return await composeWrapper(listBooks, listId);
}

async function composeWrapper(
  listBooks: (ListBook & { book: Book })[],
  listId: string
): Promise<string> {
  const wrapper: Omit<Wrapper, "wrapperBooks"> = {
    id: listId,
    numberOfBooks: listBooks.length,
    totalPages: listBooks.reduce((total, item) => total + item.book.pages, 0),
    averageRating: listBooks.length > 0 
      ? listBooks.reduce((total, item) => total + item.rating, 0) / listBooks.length 
      : 0,
    url: "/" + listId,
    date: new Date(),
    wrapped: true,
  };
  
  try {
    // Create the wrapper with connections to books through wrapperBooks
    await prisma.wrapper.create({
      data: {
        ...wrapper,
        wrapperBooks: {
          create: listBooks.map(listBook => ({
            bookId: listBook.book.id
          }))
        }
      },
    });
    
    // Mark the list as wrapped
    await prisma.list.update({
      where: { id: listId },
      data: { wrapped: true }
    });
  } catch (e) {
    console.error("Error in composeWrapper:", e);
    return "/";
  }

  return listId;
}
