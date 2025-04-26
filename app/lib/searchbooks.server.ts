import { BookItem } from "./rssParser.server";

const OPEN_LIBRARY_SEARCH_API = "https://openlibrary.org/search.json?";

interface OpenLibraryBook {
  title: string;
  author_name: string[];
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
}

interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
}

export async function searchBooks(query?: string) : Promise<OpenLibraryBook[]> {
  const endpoint = OPEN_LIBRARY_SEARCH_API + "q=" + query;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json() as OpenLibraryResponse;
  if (data && data.docs) {
    return data.docs;
  }
  return [];
}

export async function parseSearchResults(search: OpenLibraryBook[]) : Promise<BookItem[]> {
  if (!search || search.length === 0) {
    return [];
  }
  const books: BookItem[] = search.map((book: OpenLibraryBook) => ({
    title: book.title,
    author: book.author_name.join(', ') || "",
    link: `https://openlibrary.org/search?q=${encodeURIComponent(book.title)}`,
    thumbnail:  `https://covers.openlibrary.org/b/id/${book.cover_i}-S.jpg` || "",
    coverImage: `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` || "",
    rating: 0,
    pages: book.number_of_pages_median || 0,
    dateRead: new Date(),
    average_rating: 0,
    isbn: book.isbn ? book.isbn[0] : "",

  }));
  return books;
}