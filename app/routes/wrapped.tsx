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
      subHeading = "Only one book found. Keep going!";
      break;
      case data.numberOfBooks === 5:
      subHeading = "Five books found. Great job!";
      break;
      case data.numberOfBooks >= 10 && data.numberOfBooks <= 20:
      subHeading = "Between 10 and 20 books found. Impressive!";
      break;
      case data.numberOfBooks > 40:
      subHeading = "More than 40 books found. You're a reading machine!";
      break;
      default:
      subHeading = "Keep up the good work!";
    }

    return Response.json(
      { data: data, subHeading: subHeading },
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
  const { data, subHeading } = useLoaderData() as any;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <IntroAnim subtitle={subHeading} />
    </div>
  );
}
