import { useLoaderData, useFetcher } from "@remix-run/react";
import { prisma } from "~/db.server";
import { Book, ListBook } from "@prisma/client";
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
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { parseSearchResults, searchBooks } from "~/lib/searchbooks.server";
import { addSearchedBook } from "~/lib/dbfunctions.server";
import { createOrUpdateList } from "~/lib/dbfunctions.server";
import { commitSession, getSession } from "~/sessions";
import { BookForm } from "~/components/BookForm";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { initializeListId } from "~/lib/dbfunctions.server";

// Define the type of data the loader returns
interface LoaderData {
  books?: (ListBook & { book: Book })[];
  error?: string;
}

interface SearchBooksData {
  searchBooks?: Book[];
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const listId = session.get("listId")?.toString();

  console.log("Edit route - Session list ID:", listId);

  // If no listId in session, redirect to create a new list
  if (!listId) {
    // Generate a new list ID
    const newSessionId = await initializeListId(session);
    session.set("listId", newSessionId);

    return redirect("/edit", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const list = await prisma.list.findUnique({ where: { id: listId } });

  // If list doesn't exist, create an empty one
  if (!list) {
    console.log("No list found, creating empty list for ID:", listId);
    // Create a new empty list with this ID
    await createOrUpdateList(listId, "");
  }

  // Fetch books for this list - include the Book relation
  const books = await prisma.listBook.findMany({
    where: { listId: listId?.toString() },
    orderBy: { dateRead: "asc" },
    include: { book: true }, // Include the related Book entity
  });

  console.log(`Found ${books.length} books for list ID ${listId}`);

  return Response.json(
    {
      books,
      listId,
      date: session.get("date"),
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const listId = session.get("listId");
  const formData = await request.formData();
  const action = formData.get("rating")
    ? "rating"
    : formData.get("delete")
    ? "delete"
    : formData.get("search")
    ? "search"
    : formData.get("add")
    ? "add"
    : null;

  switch (action) {
    case "rating":
      await prisma.listBook.update({
        where: { id: parseInt(formData.get("bookId") as string) },
        data: { rating: parseInt(formData.get("rating") as string) },
      });
      return Response.json({ ok: true });

    case "delete":
      await prisma.listBook.delete({
        where: { id: parseInt(formData.get("bookId") as string) },
      });
      return Response.json({ ok: true });

    case "search":
      const search = await searchBooks(formData.get("search") as string);
      const searchedBooks = await parseSearchResults(search);
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
            <form action="/wrapped" method="post">
              <Button variant={"magic"} type="submit">
                Wrap Up Your List
              </Button>
            </form>
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
                        src={book.book.thumbnail}
                        alt={`Cover of ${book.book.title}`}
                        width={50}
                      />
                    </TableCell>
                    <TableCell>{book.book.title}</TableCell>
                    <TableCell>{book.book.author}</TableCell>

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
            placeholder="Search Books"
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
              <TableCaption>
                Search Results
              </TableCaption>
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
                        src={book.thumbnail}
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
