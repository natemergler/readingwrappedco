import { useEffect, useState } from 'react';
import { imageHash } from "image-hash";

interface BookItemProps {
  imageUrl: string;
  title: string;
}

// const checkHash = (imageUrl: string): Promise<string> => {
//   return new Promise((resolve) => {
//     imageHash(
//       imageUrl,
//       16,
//       true,
//       (error: Error, data: string) => {
//         if (
//           data ===
//             "ffffffffffffe007e007e007ff9ff81ff83fffff80018001ffffffffffffffff" ||
//           error
//         ) {
//           console.log("This is the same image");
//           resolve("https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png");
//         } else {
//           resolve(imageUrl);
//         }
//       }
//     );
//   });
// };

const BookItem = ({ imageUrl, title }: BookItemProps) => {
  // const [finalImageUrl, setFinalImageUrl] = useState(imageUrl);

  // useEffect(() => {
  //   checkHash(imageUrl).then(url => setFinalImageUrl(url));
  // }, [imageUrl]);
  const finalImageUrl = imageUrl;

  return (
    <div className="items-center gap-2 book-item">
      <div className="transform transition-transform hover:scale-105">
        <div className="relative shadow-lg hover:shadow-xl rounded">
          <img
            draggable="false"
            src={finalImageUrl || "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png"}
            alt={finalImageUrl ? `Cover of ${title}` : "No cover image"}
            className="w-full h-full object-cover rounded transform perspective-800 rotate-y-3 hover:rotate-y-0 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default BookItem;
