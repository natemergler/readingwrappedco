import { FormProps, useFetcher } from "@remix-run/react";
import { Star, BookMinus, BookPlus } from "lucide-react";
import { Input } from "~/components/ui/input";

interface BookFormProps extends FormProps {
  bookId: number;
  rating?: number;
  delete?: boolean;
  search?: boolean;
  add?: string;
}

export function BookForm({
  bookId,
  rating,
  delete: deleteBook,
  search,
  add,
  ...rest
}: BookFormProps) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action="/edit" {...rest}>
      <input type="hidden" name="bookId" value={bookId} />
      {rating !== undefined &&
        [...Array(5)].map((_, i) => (
          <button key={i} type="submit" name="rating" value={i + 1}>
            <Star
              size={16}
              fill={i < rating ? "currentColor" : "none"}
            />
          </button>
        ))}
      {deleteBook && (
        <button type="submit" name="delete" value={bookId}>
          <BookMinus size={16} />
        </button>
      )}
      {search !== undefined && (
        <Input type="text" name="search" placeholder="Search to add books" />
      )}
      {add !== undefined && (
        <button type="submit" name="add" value={add}>
          <BookPlus size={16} />
        </button>
      )}
    </fetcher.Form>
  );
}