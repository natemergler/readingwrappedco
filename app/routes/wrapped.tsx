import { useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
import { prisma } from "~/db.server";
import { Book } from "@prisma/client";
import { wrapItUp } from "~/utils/wrapItUp";
import { motion } from "motion/react";
import IntroAnim from "~/components/introAnim";
import BookItem from "~/components/BookItem";
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    const grid = document.getElementById("dynamic-grid");
    const bookContainers = Array.from(document.getElementsByClassName("book-item")) as HTMLElement[];
    if (!grid) return;
    function resizeGrid() {
      const numItems = grid?.children.length || 0;
      const gridHeight = grid?.clientHeight;
      const gridWidth = grid?.clientWidth;

      const defaultSize = 128*196;

      const areaPerItem = (gridHeight * gridWidth) / numItems;
      const scaler = Math.sqrt( areaPerItem / defaultSize);
      const itemWidth = 128 * scaler;
      const itemHeight = 196 * scaler;

      bookContainers.forEach(element => {
        element.style.width = `${itemWidth}px`;
        element.style.height = `${itemHeight}px`;
        
      });

    }

    resizeGrid();
    window.addEventListener("resize", resizeGrid);
  }, []);

  return (
    <div className="items-center justify-center w-screen h-screen p-2">
      <motion.div ref={constraintsRef} className="size-full">
        <IntroAnim
          booksCount={bookList.length}
          pages={data.totalPages}
          averageRating={data.averageRating}
        />
        <div id="dynamic-grid" className="flex flex-wrap p-4 gap-4 ">
          {bookList.map((book: Book) => (
            <motion.div
              drag
              dragConstraints={constraintsRef}
              dragElastic={0.9}
              whileDrag={{ scale: 0.9 }}
              key={book.id}
              initial={{ scaleY: 0, x: -100 }}
              animate={{ scaleY: 1, x: 0 }}
              transition={{
                type: "spring",
                bounce: 0.4,
                delay: (bookList.indexOf(book) / bookList.length) * 5,
              }}
              className="book-item"
            >
              <BookItem imageUrl={book.coverImage} title={book.title} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
