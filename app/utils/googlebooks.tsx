import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function searchBooks(title?: string, author?: string) {
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

export async function parseGoogleBooksResponse(response: any) {
  const books = response.filter((item: any) => {
    const volumeInfo = item.volumeInfo;
    return volumeInfo.title && volumeInfo.authors?.[0] && volumeInfo.imageLinks?.thumbnail && volumeInfo.pageCount;
  }).map((item: any) => {
    const volumeInfo = item.volumeInfo;
    return {
      title: volumeInfo.title,
      author: volumeInfo.authors[0],
      link: volumeInfo.previewLink || '',
      coverImage: volumeInfo.imageLinks.thumbnail,
      rating: 0,
      pages: volumeInfo.pageCount,
      dateRead: new Date(),
      average_rating: volumeInfo.averageRating || 0,
    };
  });
  return books;
}

