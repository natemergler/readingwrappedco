import { Book } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion } from "motion/react";
import { useRef, useEffect } from "react";
import BookItem from "~/components/BookItem";
import IntroAnim from "~/components/introAnim";
import { prisma } from "~/db.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const books = await prisma.book.findMany({
    where: { listId: params.listId },
    orderBy: { dateRead: "asc" },
  });

  const wrapped = await prisma.wrapper.findFirst({
    where: { id: params.listId },
  });
  return Response.json({ data: wrapped, bookList: books });
}

// Main component
export default function Index() {
  const { data, bookList } = useLoaderData() as any;
  const constraintsRef = useRef(null);

  function handleBookClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.currentTarget;
    // Reset z-index for all books
    const bookItems = Array.from(
      document.querySelectorAll(".book-item") as NodeListOf<HTMLElement>
    ).sort(
      (a, b) =>
        (parseInt(a.style.zIndex) || 0) - (parseInt(b.style.zIndex) || 0)
    );
    const targetIndex = bookItems.findIndex((item) => item === target);
    const reorderedItems = [
      ...bookItems.slice(0, targetIndex),
      ...bookItems.slice(targetIndex + 1),
      target,
    ];

    reorderedItems.forEach((item, index) => {
      item.style.zIndex = (index + 1).toString();
    });
  }

  useEffect(() => {
    const grid = document.getElementById("dynamic-grid");
    const bookContainers = Array.from(
      document.getElementsByClassName("book-item")
    ) as HTMLElement[];
    if (!grid) return;

    function resizeGrid() {
      const numItems = bookContainers.length || 0;
      const gridHeight = grid?.clientHeight ?? 0;
      const gridWidth = grid?.clientWidth ?? 0;

      const defaultSize = 128 * 196;
      const areaPerItem = (gridHeight * gridWidth) / numItems;
      const scaler = Math.sqrt(areaPerItem / defaultSize);
      const itemWidth = 128 * scaler;
      const itemHeight = 196 * scaler;

      bookContainers.forEach((element) => {
        element.style.width = `${itemWidth}px`;
        element.style.height = `${itemHeight}px`;
      });
    }

    // Initial resize
    resizeGrid();

    // Add resize listener
    window.addEventListener("resize", resizeGrid);

    // Cleanup: remove listener when component unmounts
    return () => window.removeEventListener("resize", resizeGrid);
  }, []);

  return (
    <div className="items-center justify-center w-screen h-screen overflow-hidden">
      <motion.div ref={constraintsRef} className="size-full">
        <IntroAnim
          booksCount={bookList.length}
          pages={data.totalPages}
          averageRating={data.averageRating}
          url={"/wrapped"+data.url}
        />
        <div
          id="dynamic-grid"
          className="flex flex-wrap gap-4 p-4 w-full h-[calc(100%-300px)]"
        >
          {bookList.map((book: Book, index: number) => (
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
              onClick={handleBookClick}
              style={{ zIndex: index + 1 }}
            >
              <BookItem imageUrl={book.coverImage} title={book.title} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
