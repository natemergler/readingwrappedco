import { useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
import { prisma } from "~/db.server";
import { Book } from "@prisma/client";
import { wrapItUp } from "~/utils/wrapItUp";
import { motion } from "motion/react";
import IntroAnim from "~/components/introAnim";
import BookItem from "~/components/BookItem";

// Define the type of data the loader returns
interface LoaderData {
  data?: any; // Adjust based on actual data structure
  subheading?: string;
  error?: string;
  ok?: string;
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const feedUrl = session.get("listId");
  try {
    const list = await prisma.list.findUniqueOrThrow({
      where: { id: feedUrl as string },
    });
    const bookList = await prisma.book.findMany({ where: { listId: list.id } });
    const data = wrapItUp(bookList);

    return Response.json(
      { data: data, bookList: bookList },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } catch (e) {}

  return Response.json({ error: "No Feed URL provided" });
}

// Main component
export default function Index() {
  const { data, subHeading, bookList } = useLoaderData() as any;
  

  return (
    <div className="flex flex-col items-center justify-center w-screen m-4">
      <IntroAnim subtitle={bookList.length} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {bookList.map((book: Book) => (
            <motion.div
            key={book.id}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", bounce: 0.4, delay: (bookList.indexOf(book)/bookList.length) * 5 }}
            >
            <BookItem imageUrl={book.coverImage} title={book.title} />
            </motion.div>
        ))}
      </div>
    </div>
  );
}
