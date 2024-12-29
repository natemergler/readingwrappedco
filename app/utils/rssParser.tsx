// Define the structure of a parsed book item
import { XMLParser } from "fast-xml-parser";
import { prisma } from "~/db.server";
import { addCoverImage, returnCoverImage } from "./googlebooks";

export interface BookItem {
  title: string;
  author: string;
  link: string;
  thumbnail: string;
  coverImage: string;
  rating: number;
  pages: number;
  dateRead: Date;
  average_rating: number;
  isbn: string;
}

export async function parseRSS(feedContent: string): Promise<BookItem[]> {
  // Parse the RSS feed content
  const cleanedFeedContent = cleanFeedContent(feedContent);
  const xmlFeed = await fetchRssFeed(`https://www.${cleanedFeedContent}`);
  const feed = parseXML(xmlFeed);

  // Create or update the list
  await createOrUpdateList(cleanedFeedContent);
  // Extract the fields you need from each item
  const books = feed.rss.channel.item.map(async (item: any) => {
    if (item.user_read_at !== "") {
      const bookItem = extractGoodReadsBook(item);
      await createBookIfNeeded(bookItem, cleanedFeedContent);
      return bookItem;
    }
  });
  return books;
}

function cleanFeedContent(feedContent: string): string {
  if (!feedContent.startsWith("goodreads.com/review/list_rss/")) {
    throw new Error();
  }
  return feedContent;
}

async function fetchRssFeed(url: string): Promise<string> {
  const response = await fetch(url);
  const xmlString = await response.text();
  return xmlString; // This is the XML content as a string
}

function parseXML(xmlString: string): any {
  const parser = new XMLParser();
  return parser.parse(xmlString);
}

export async function createOrUpdateList(feedContent: string): Promise<void> {
  try {
    await prisma.list.create({
      data: {
        id: feedContent,
        date: new Date(),
      },
    });
  } catch (e) {}
}

function extractGoodReadsBook(item: any): BookItem {
  return {
    title: item.title || "Unknown title",
    author: item.author_name || "Unknown author",
    link: item.link || "",
    thumbnail: item.book_image_url || "",
    coverImage: item.book_image_url || "",
    rating: parseFloat(item.user_rating),
    pages: parseFloat(item.book?.num_pages),
    dateRead: new Date(item.user_read_at) || "",
    average_rating: parseFloat(item.average_rating),
    isbn: item.isbn || "",
  };
}

export async function createBookIfNeeded(
  bookItem: BookItem,
  feedContent: string
): Promise<void> {
  const thresholdDate = new Date(2024, 0, 1);
  if (
    bookItem.dateRead > thresholdDate &&
    (await prisma.book.findFirst({
      where: {
        AND: {
          listId: feedContent,
          title: bookItem.title,
          author: bookItem.author,
        },
      },
    })) === null
  ) {
    const coverImage = await returnCoverImage(bookItem);
    console.log(coverImage);

    await prisma.book.create({
      data: {
        title: bookItem.title,
        author: bookItem.author,
        goodReadsLink: bookItem.link,
        coverImage: coverImage,
        thumbnail: bookItem.thumbnail,
        rating: bookItem.rating,
        pages: bookItem.pages,
        dateRead: bookItem.dateRead,
        average_rating: bookItem.average_rating,
        isbn: String(bookItem.isbn),
        listId: feedContent,
      },
    });
  }
}

export async function addSearchedBook(
  bookItem: BookItem,
  feedContent: string
): Promise<void> {
  if (
    (await prisma.book.findFirst({
      where: {
        AND: {
          listId: feedContent,
          title: bookItem.title,
          author: bookItem.author,
        },
      },
    })) === null
  ) {
    await prisma.book.create({
      data: {
        title: bookItem.title,
        author: bookItem.author,
        goodReadsLink: bookItem.link,
        thumbnail: bookItem.thumbnail,
        coverImage: bookItem.coverImage,
        rating: bookItem.rating,
        pages: bookItem.pages,
        dateRead: bookItem.dateRead,
        average_rating: bookItem.average_rating,
        isbn: bookItem.isbn,
        listId: feedContent,
      },
    });
  }
}
