import axios from 'axios';
import dotenv from 'dotenv';
import { BookItem } from './rssParser.server';
import { i } from 'node_modules/vite/dist/node/types.d-aGj9QkWt';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function searchBooks(title?: string, author?: string) {
  if (!title && !author) return [];
  title = encodeURIComponent(title || '');
  if (author) {
    title += `+inauthor:${encodeURIComponent(author)}`;
  }
  let query = 'https://www.googleapis.com/books/v1/volumes?q='+title;

  query += `&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(query);
    if (response.status === 200) {
    return response.data.items;
    } else {
      console.error('Received non-200 status code:', response.status);
    return [];
  }
  } catch (error) {
    console.error('Error searching for books:', error);
    return [];
}
}

export async function getBookInfo(volumeId: string) {
  const query = `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_API_KEY}`;
  console.log('query:', query);

  try {
    const response = await axios.get(query);
    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Received non-200 status code:', response.status);
      return {};
    }
  } catch (error) {
    console.error('Error fetching book info:', error);
    return {};
  }
}

export async function parseSearchedResponse(response: any) {
  const books = response.filter((item: any) => {
    const volumeInfo = item.volumeInfo;
    return volumeInfo.title && volumeInfo.authors?.[0] && volumeInfo.imageLinks?.thumbnail && volumeInfo.pageCount;
  }).map((item: any) => {
    const volumeInfo = item.volumeInfo;
    const isbn = volumeInfo.industryIdentifiers?.find((id: any) => 
      id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier || '';
    
    return {
      title: volumeInfo.title,
      author: volumeInfo.authors[0],
      link: volumeInfo.previewLink || '',
      thumbnail: volumeInfo.imageLinks.thumbnail,
      coverImage: volumeInfo.imageLinks.small || volumeInfo.imageLinks.thumbnail,
      rating: 0,
      pages: volumeInfo.pageCount,
      dateRead: new Date(),
      average_rating: volumeInfo.averageRating || 0,
      isbn: String(isbn),
    };
  });
  return books;
}

