import { Book, WrapperBook, Wrapper } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion } from "motion/react";
import { useRef, useEffect } from "react";
import BookItem from "~/components/BookItem";
import IntroAnim from "~/components/introAnim";
import { prisma } from "~/db.server";

// Define proper types for loader data
interface LoaderData {
  data: Wrapper;
  bookList: (WrapperBook & { book: Book })[];
}

export async function loader({ params }: LoaderFunctionArgs) {
  const books = await prisma.wrapperBook.findMany({
    where: { wrapperId: params.listId },
    include: { book: true },
  });

  const wrapped = await prisma.wrapper.findFirst({
    where: { id: params.listId },
  });
  
  return Response.json({ data: wrapped, bookList: books });
}

// Main component
export default function Index() {
  // Use proper type annotation
  const { data, bookList } = useLoaderData<typeof loader>() as LoaderData;
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
    <div className="items-center justify-center w-[95vw] h-[95vh] overflow-hidden">
      <motion.div ref={constraintsRef} className="w-full h-full">
        <IntroAnim
          booksCount={bookList.length}
          pages={data.totalPages}
          averageRating={data.averageRating}
          shortUrl={"/wrapped" + data.url}
        />
        <div
          id="dynamic-grid"
          className="flex flex-wrap gap-4 p-4 w-full h-[calc(100%-300px)]"
        >
          {bookList.map((book: WrapperBook & { book: Book }, index: number) => (
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
              {/* Fixed property access */}
              <BookItem imageUrl={book.book.coverImage} title={book.book.title} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
