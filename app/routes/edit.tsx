import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { prisma } from "~/db.server";
import { Book } from "@prisma/client";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { ActionFunctionArgs } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { parseGoogleBooksResponse, searchBooks } from "~/utils/googlebooks";
import { addSearchedBook, createOrUpdateList } from "~/utils/rssParser";
import { commitSession, getSession } from "~/sessions";
import { nanoid } from "nanoid";
import { BookForm } from "~/components/BookForm";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

// Define the type of data the loader returns
interface LoaderData {
  books?: Book[];
  error?: string;
}

interface SearchBooksData {
  searchBooks?: Book[];
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const listId = session.get("listId");
  if (!listId) {
    let randomId = nanoid(8);
    while (
      (await prisma.list.findUnique({ where: { id: randomId } })) != null
    ) {
      randomId = nanoid(14);
    }
    session.set("listId", randomId);
    await createOrUpdateList(randomId);
  }
  try {
    const feedUrl = String(session.get("listId"));

    const books = await prisma.book.findMany({ where: { listId: feedUrl }, orderBy: { dateRead: 'asc' } });
    return Response.json(
      { books },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } catch (e) {
    return Response.json({ error: "Failed to fetch books" });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const listId = session.get("listId");
  const formData = await request.formData();
  const bookId = formData.get("bookId");
  const action = formData.get("rating") ? "rating" :
                 formData.get("delete") ? "delete" :
                 formData.get("search") ? "search" :
                 formData.get("add") ? "add" : null;

  switch (action) {
    case "rating":
      await prisma.book.update({
        where: { id: parseInt(formData.get("bookId") as string) },
        data: { rating: parseInt(formData.get("rating") as string) },
      });
      return Response.json({ ok: true });

    case "delete":
      await prisma.book.delete({
        where: { id: parseInt(formData.get("bookId") as string) },
      });
      return Response.json({ ok: true });

    case "search":
      const search = await searchBooks(formData.get("search") as string);
      const searchedBooks = await parseGoogleBooksResponse(search);
      return Response.json({ searchBooks: searchedBooks });

    case "add":
      const book = JSON.parse(formData.get("add") as string);
      await addSearchedBook(book, listId as string);
      return Response.json({ ok: true });

    default:
      return Response.json({ error: "Invalid action" });
  }
  return Response.json({ ok: true });
}

// Main component
export default function Edit() {
  const { books, error } = useLoaderData<LoaderData>();
  const fetcher = useFetcher<SearchBooksData>();
  const formData = fetcher.data;
  return (
    <div className="flex justify-center items-center p-5 max-w-4xl mx-auto">
      <div className=" grid gap-5 w-full">
        {books == null || books.length == 0 ? null : (
          <motion.div
            animate={{
              rotate: [0, -1, 1, -1, 1, -1, 1, -1, 1, -1, 0], // Your rotation values
            }}
            transition={{
              duration: 2, // Total duration for one complete cycle (1s animation + 3s pause)
              repeat: Infinity, // Repeat the animation indefinitely
              ease: "linear", // Optional: Ensures consistent speed throughout the animation
              repeatDelay: 2,
            }}
            className="flex justify-center items-center"
          >
            <Link to="/wrapped"><Button variant={"magic"}>Wrap Up Your List</Button></Link>
          </motion.div>
        )}

        <h1>Edit Books</h1>
        {error ? (
          <p>{error}</p>
        ) : (
          <div>
            <Table>
              <TableCaption>Edit your book list</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Remove</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books?.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>
                      <img
                        src={book.coverImage}
                        alt={`Cover of ${book.title}`}
                        width={50}
                      />
                    </TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>

                    <TableCell>
                      <BookForm bookId={book.id} rating={book.rating} />
                    </TableCell>
                    <TableCell>
                      <BookForm bookId={book.id} delete />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <fetcher.Form
          method="post"
          action="/Edit"
          className="flex flex-row gap-5"
        >
          <Input
            className="flex-auto w-64"
            type="text"
            name="search"
            placeholder="Search to add books — The more specific your terms, the better."
          />
          {fetcher.state === "idle" ? (
            <Button
              className="flex auto w-32"
              variant="secondary"
              type="submit"
            >
              Search
            </Button>
          ) : (
            <Button className="flex auto w-32" variant="secondary" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching
            </Button>
          )}
        </fetcher.Form>
        {formData?.searchBooks && (
          <div>
            <Table>
              <TableCaption>Search Results — If your result is not found, try more specific search terms.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Cover</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Add</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formData?.searchBooks?.map((book, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <img
                        src={book.coverImage}
                        alt={`Cover of ${book.title}`}
                        width={50}
                      />
                    </TableCell>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <BookForm add={JSON.stringify(book)} bookId={index} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
