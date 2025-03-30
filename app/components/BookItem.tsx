import { useEffect, useState } from 'react';

interface BookItemProps {
  imageUrl: string;
  title: string;
}

const DEFAULT_IMAGE = "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png";

const BookItem = ({ imageUrl, title }: BookItemProps) => {

  return (
    <div className="items-center gap-2 book-item">
      <div className="transform transition-transform hover:scale-105">
        <div className="relative shadow-lg hover:shadow-xl rounded">
          <img
            draggable="false"
            src={imageUrl}
            alt={imageUrl ? `Cover of ${title}` : "No cover image"}
            className="w-full h-full object-cover rounded transform perspective-800 rotate-y-3 hover:rotate-y-0 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  );
};

export default BookItem;
