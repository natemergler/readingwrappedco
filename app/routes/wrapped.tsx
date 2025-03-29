import { redirect } from "@remix-run/react";
import { getSession, destroySession } from "../sessions";
import { prisma } from "~/db.server";
import { wrapItUp } from "~/lib/wrapItUp.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  try {
    const listId = session.get("listId")?.toString();
    if (!listId ) {
      return redirect("/");
    }
    const listBooks = await prisma.listBook.findMany({ 
      where: { listId: listId },
      include: { book: true }
    });
    const books = listBooks.map(item => item.book);
    const data = await wrapItUp(listId);
    return redirect(data, {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  } catch (e) {
    console.error("Error in wrapped loader:", e);
    return redirect("/", {
      // Redirect to home page instead of /error
      status: 302,
    });
  }
}
