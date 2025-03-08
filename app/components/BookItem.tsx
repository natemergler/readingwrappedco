import { useEffect, useState } from 'react';

interface BookItemProps {
  imageUrl: string;
  title: string;
}

const DEFAULT_IMAGE = "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png";

const BookItem = ({ imageUrl, title }: BookItemProps) => {
  const [finalImageUrl, setFinalImageUrl] = useState(imageUrl);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateImage = async () => {
      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('imageUrl', imageUrl);
        
        const response = await fetch('/api/check-image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setFinalImageUrl(data.imageUrl);
        } else {
          console.error('Failed to validate image');
          setFinalImageUrl(DEFAULT_IMAGE);
        }
      } catch (error) {
        console.error('Error validating image:', error);
        setFinalImageUrl(DEFAULT_IMAGE);
      } finally {
        setIsLoading(false);
      }
    };

    if (imageUrl) {
      validateImage();
    } else {
      setFinalImageUrl(DEFAULT_IMAGE);
      setIsLoading(false);
    }
  }, [imageUrl]);

  return (
    <div className="items-center gap-2 book-item">
      <div className="transform transition-transform hover:scale-105">
        <div className="relative shadow-lg hover:shadow-xl rounded">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            draggable="false"
            src={finalImageUrl || DEFAULT_IMAGE}
            alt={finalImageUrl ? `Cover of ${title}` : "No cover image"}
            className="w-full h-full object-cover rounded transform perspective-800 rotate-y-3 hover:rotate-y-0 transition-transform duration-300"
            style={{ opacity: isLoading ? 0 : 1 }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setFinalImageUrl(DEFAULT_IMAGE);
              setIsLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookItem;
