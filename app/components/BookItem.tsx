interface BookItemProps {
  imageUrl: string;
  title: string;
}

const BookItem = ({ imageUrl, title }: BookItemProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="transform transition-transform hover:scale-105">
        <div className="w-32 h-48 relative shadow-lg hover:shadow-xl rounded">
          <img
            draggable="false"
            src={
              imageUrl ||
              "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png"
            }
            alt={imageUrl ? `Cover of ${title}` : "No cover image"}
            className="w-full h-full object-cover rounded transform perspective-800 rotate-y-3 hover:rotate-y-0 transition-transform duration-300"
          />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-800 text-center max-w-[128px] line-clamp-2">
        {title}
      </h3>
    </div>
  );
};

export default BookItem;
