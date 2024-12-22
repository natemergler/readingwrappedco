import type { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession, commitSession, destroySession } from "../sessions";
import { prisma } from "~/db.server";
import { List, Book } from "@prisma/client";
import { wrapItUp } from "~/utils/wrapItUp";
import CardItem from "~/components/cardItem"; // Updated import statement
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "~/components/ui/carousel";
import { motion } from "motion/react";
import Intro from "~/components/introAnim";
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
    let subHeading = "";

    switch (true) {
      case data.numberOfBooks === 0:
      subHeading = "No books found. Time to start reading!";
      break;
      case data.numberOfBooks === 1:
      subHeading = "Only one book found. That's all you managed in a year?";
      break;
      case data.numberOfBooks === 12:
      subHeading = "A book a month! Not bad, but you can do better!";
      break;
      case data.numberOfBooks >= 10 && data.numberOfBooks <= 30:
      subHeading = "Nice!" + data.numberOfBooks + " books read.";
      break;
      case data.numberOfBooks > 52:
      subHeading = "More than a book a week! Great job!";
      break;
      default:
      subHeading = "You somehow broke this!";
    }

    return Response.json(
      { data: data, subHeading: subHeading, bookList: bookList },
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
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <IntroAnim subtitle={subHeading} />
      <BookItem imageUrl={bookList[0].coverImage} title={bookList[0].title} />
    </div>
  );
}
