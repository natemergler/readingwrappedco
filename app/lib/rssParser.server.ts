// Define the structure of a parsed book item
import { XMLParser } from "fast-xml-parser";
import { createBookIfNeeded, createOrUpdateList } from "./dbfunctions.server";

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

export async function parseRSS(
  listId: string,
  feedContent: string
): Promise<BookItem[]> {
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
  const regex = /goodreads\.com\/review\/(list_rss|list)\/(\d+)/;
  const match = feedContent.match(regex);

  if (!match) {
    throw new Error("Invalid Goodreads URL format");
  }

  const [, type, numbers] = match;

  // If type is 'list', convert to 'list_rss'
  const correctType = type === "list" ? "list_rss" : type;

  // Ensure URL ends with ?shelf=read and sort parameters
  const baseUrl = `goodreads.com/review/${correctType}/${numbers}?shelf=read&sort=date_read&order=d`;
  return baseUrl;
}

async function fetchRssFeed(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const xmlString = await response.text();
    return xmlString; // This is the XML content as a string
  } catch (e) {
    throw new Error();
    return "";
  }
}

function parseXML(xmlString: string): any {
  const parser = new XMLParser();
  return parser.parse(xmlString);
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
