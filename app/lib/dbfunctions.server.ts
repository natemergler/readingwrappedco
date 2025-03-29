import { Session } from "@remix-run/node";
import { nanoid } from "nanoid";
import { prisma } from "~/db.server";

export async function initializeListId(session: Session) {
    let randomId = nanoid(8);
    while ((await prisma.list.findUnique({ where: { id: randomId } })) != null) {
      randomId = nanoid(14);
    }
    return randomId;
  }

import { imageHash } from "image-hash";
import { BookItem } from "./rssParser.server";

// Known hash for the default/placeholder Google Books cover image
const PLACEHOLDER_HASH = "ffffffffffffe007e007e007ff9ff81ff83fffff80018001ffffffffffffffff";
const DEFAULT_IMAGE = "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png";

export async function checkImageHash(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    imageHash(
      imageUrl,
      16,
      true,
      (error: Error, data: string) => {
        if (data === PLACEHOLDER_HASH || error) {
          resolve(DEFAULT_IMAGE);
        } else {
          resolve(imageUrl);
        }
      }
    );
  });
}
export async function createOrUpdateList(
  listId: string,
  feedContent?: string
): Promise<string> {
  if (!listId) {
    throw new Error("listId is required");
  }

  try {
    const now = new Date();

    // First check if list exists
    const existingList = await prisma.list.findUnique({
      where: { id: listId },
    });

    if (existingList) {
      // Update existing list
      await prisma.list.update({
        where: { id: listId },
        data: {
          goodreadsUrl: feedContent,
          date: now,
          // Only update wrapped status if it's not already true
          wrapped: existingList.wrapped || false,
        },
      });
    } else {
      // Create new list
      await prisma.list.create({
        data: {
          id: listId,
          goodreadsUrl: feedContent,
          date: now,
          wrapped: false,
        },
      });
    }

    return listId; // Return the listId
  } catch (e) {
    console.error("Error in createOrUpdateList:", e);
    throw new Error("Failed to create or update list");
  }
}export async function createBookIfNeeded(
  bookItem: BookItem,
  listId: string
): Promise<void> {
  const thresholdDate = new Date(2024, 0, 1);
  if (bookItem.dateRead <= thresholdDate) {
    return; // Skip books read before 2024
  }

  // First find if book already exists
  let book = await prisma.book.findFirst({
    where: {
      AND: {
        title: bookItem.title.toString(),
        author: bookItem.author,
      },
    },
  });

  // If book doesn't exist, create it
  if (!book) {
    const coverImage = bookItem.thumbnail;

    book = await prisma.book.create({
      data: {
        title: bookItem.title.toString(),
        author: bookItem.author,
        goodReadsLink: bookItem.link,
        coverImage: coverImage,
        thumbnail: bookItem.thumbnail,
        pages: bookItem.pages,
        average_rating: bookItem.average_rating,
        isbn: String(bookItem.isbn),
      },
    });
  }

  // Check if this book is already in the list
  const existingListBook = await prisma.listBook.findFirst({
    where: {
      bookId: book.id,
      listId: listId,
    },
  });

  // If not, add it to the list
  if (!existingListBook) {
    await prisma.listBook.create({
      data: {
        bookId: book.id,
        listId: listId,
        rating: bookItem.rating,
        dateRead: bookItem.dateRead,
      },
    });
  }
}
export async function addSearchedBook(
  bookItem: BookItem,
  feedContent: string
): Promise<void> {
  // Get the proper listId from createOrUpdateList
  const listId = await createOrUpdateList(feedContent);

  // Use the returned listId when creating the book
  await createBookIfNeeded(bookItem, listId);
}

