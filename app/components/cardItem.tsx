import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface Props {
  data: any;
}

export const CardItem = ({ data }: Props) => {
  return (
    <Card className="w-70">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
          <h2 className="text-lg font-bold">Reading Statistics</h2>
          <div className="grid gap-4">
            <p>Number of books: {data.numberOfBooks}</p>
            <p>Total pages: {data.totalPages}</p>
            <p>Top favorite authors: {data.topFavoriteAuthors.join(", ")}</p>
            <p>
              Lowest rated book: {data.lowestRatedBook.title} by{" "}
              {data.lowestRatedBook.author} ({data.lowestRatedBook.rating}{" "}
              stars)
            </p>
            <p>
              Highest rated book: {data.highestRatedBook.title} by{" "}
              {data.highestRatedBook.author} ({data.highestRatedBook.rating}{" "}
              stars)
            </p>
            <p>Average rating: {data.averageRating}</p>
          </div>
      </CardContent>
    </Card>
  );
};

export default CardItem;
