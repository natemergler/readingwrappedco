import axios from "axios";
import dotenv from "dotenv";
import { imageHash } from "image-hash";

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

export async function searchBooks(title?: string, author?: string) {
  if (!title && !author) return [];
  title = encodeURIComponent(title || "");
  if (author) {
    title += `+inauthor:${encodeURIComponent(author)}`;
  }
  let query = "https://www.googleapis.com/books/v1/volumes?q=" + title;

  query += `&key=${GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(query);
    if (response.status === 200) {
      return response.data.items;
    } else {
      console.error("Received non-200 status code:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error searching for books:", error);
    return [];
  }
}

export async function getBookInfo(volumeId: string) {
  const query = `https://www.googleapis.com/books/v1/volumes/${volumeId}?key=${GOOGLE_API_KEY}`;
  console.log("query:", query);

  try {
    const response = await axios.get(query);
    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Received non-200 status code:", response.data);
      return {};
    }
  } catch (error) {
    console.error("Error fetching book info:", error);
    return {};
  }
}

export async function parseSearchedResponse(response: any) {
  const books = response
    .filter((item: any) => {
      const volumeInfo = item.volumeInfo;
      return (
        volumeInfo.title &&
        volumeInfo.authors?.[0] &&
        volumeInfo.imageLinks?.thumbnail &&
        volumeInfo.pageCount
      );
    })
    .map((item: any) => {
      const volumeInfo = item.volumeInfo;
      const isbn =
        volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_13" || id.type === "ISBN_10"
        )?.identifier || "";

      const coverImage = getBookCover(item.id);
      return {
        title: volumeInfo.title,
        author: volumeInfo.authors[0],
        link: volumeInfo.previewLink || "",
        thumbnail: volumeInfo.imageLinks.thumbnail,
        coverImage: coverImage || volumeInfo.imageLinks.thumbnail,
        rating: 0,
        pages: volumeInfo.pageCount,
        dateRead: new Date(),
        average_rating: volumeInfo.averageRating || 0,
        isbn: String(isbn),
      };
    });
  return books;
}

// Known hash for the default/placeholder Google Books cover image
const PLACEHOLDER_HASH =
  "ffffffffffffe007e007e007ff9ff81ff83fffff80018001ffffffffffffffff";
const DEFAULT_IMAGE =
  "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png";

export async function checkImageHash(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    imageHash(imageUrl, 16, true, (error: Error, data: string) => {
      if (data === PLACEHOLDER_HASH || error) {
        resolve(DEFAULT_IMAGE);
      } else {
        resolve(imageUrl);
      }
    });
  });
}

export async function getBookCover(googleId: string): Promise<string> {
  const coverImage = `https://books.google.com/books/content?id=${googleId}&printsec=frontcover&img=1&zoom=0&edge=curl&source=gbs_api`;
  return await checkImageHash(coverImage);
}
