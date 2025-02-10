// Define the structure of a parsed book item
import { XMLParser } from "fast-xml-parser";
import { prisma } from "~/db.server";
import { addCoverImage, returnCoverImage } from "./googlebooks.server";

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

export async function parseRSS(listId: string, feedContent: string): Promise<BookItem[]> {
  const cleanedFeedContent = await cleanFeedContent(feedContent);
  const xmlFeed = await fetchRssFeed(`https://www.${cleanedFeedContent}`);
  const feed = parseXML(xmlFeed);

  // Wait for list creation to complete
  await createOrUpdateList(listId, cleanedFeedContent);

  // Use Promise.all to wait for all book creations
  const books = await Promise.all(
    feed.rss.channel.item
      .filter((item: any) => item.user_read_at !== "")
      .map(async (item: any) => {
        const bookItem = extractGoodReadsBook(item);
        await createBookIfNeeded(bookItem, listId); // Pass listId instead of cleanedFeedContent
        return bookItem;
      })
  );

  return books.filter((book): book is BookItem => book !== undefined);
}

export async function cleanFeedContent(feedContent: string): Promise<string> {
  // Regular expression to match either list_rss or list followed by numbers
  const regex = /^(?:https?:\/\/)?(?:www\.)?goodreads\.com\/review\/(list_rss|list)\/(\d+)/;
  const match = feedContent.match(regex);

  if (!match) {
    throw new Error("Invalid Goodreads URL format");
  }

  const [, type, numbers] = match;
  
  // If type is 'list', convert to 'list_rss'
  const correctType = type === 'list' ? 'list_rss' : type;
  
  // Ensure URL ends with ?shelf=read
  const baseUrl = `goodreads.com/review/${correctType}/${numbers}`;
  return baseUrl + (feedContent.includes('?shelf=read') ? '' : '?shelf=read') + (feedContent.includes('&sort=date_read&order=d'));
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

export async function createOrUpdateList(listId: string, feedContent?: string): Promise<void> {
  try {
    await prisma.list.upsert({
      where: {
        id: listId,
      },
      create: {
        id: listId,
        goodreadsUrl: feedContent,
        date: new Date(),
      },
      update: {
        goodreadsUrl: feedContent,
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
