import { useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
import { prisma } from "~/db.server";
import { Book } from "@prisma/client";
import { wrapItUp } from "~/utils/wrapItUp";
import { motion } from "motion/react";
import IntroAnim from "~/components/introAnim";
import BookItem from "~/components/BookItem";
import { useRef } from "react";

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
  const { data, bookList } = useLoaderData() as any;
  const constraintsRef = useRef(null);

  return (
    <div className="flex flex-col items-center justify-center w-screen p-2">
      <motion.div ref={constraintsRef} className="w-full">
        <IntroAnim
          booksCount={bookList.length}
          pages={data.totalPages}
          averageRating={data.averageRating}
        />
        <div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
       gap-4 p-4"
        >
          {bookList.map((book: Book) => (
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              whileDrag={{ scale: 0.9 }}
              key={book.id}
              initial={{ scaleY: 0, x:-100 }}
              animate={{ scaleY: 1, x:0 }}
              transition={{
                type: "spring",
                bounce: 0.4,
                delay: (bookList.indexOf(book) / bookList.length) * 5,
              }}
            >
              <BookItem imageUrl={book.coverImage} title={book.title} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
