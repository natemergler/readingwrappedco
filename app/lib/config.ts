export const GOOGLE_BOOKS_API = {
  KEY: process.env.GOOGLE_API_KEY,
  BASE_URL: 'https://www.googleapis.com/books/v1/volumes',
};

export interface GoogleBooksResponse {
  volumeInfo: GoogleBooksVolumeInfo;
}

export interface GoogleBooksVolumeInfo {
  title: string;
  authors?: string[];
  previewLink?: string;
  imageLinks?: {
    thumbnail?: string;
    small?: string;
    medium?: string;
  };
  pageCount?: number;
  averageRating?: number;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

export interface GoogleBooksSearchParams {
  title?: string;
  author?: string;
  isbn?: string;
  maxResults?: number;
}

export const DEFAULT_SEARCH_PARAMS = {
  maxResults: 10
};
