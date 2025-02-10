import { redirect, useLoaderData } from "@remix-run/react";
import { getSession, commitSession } from "../sessions";
import { prisma } from "~/db.server";
import { wrapItUp } from "~/lib/wrapItUp.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  try {
    const listId = session.get("listId")?.toString();
    const list = await prisma.list.findFirst({
      where: { id: listId },
    });
    if (!listId || !list) {
      return redirect("/");
    }
    const bookList = await prisma.book.findMany({ where: { listId: list.id } });
    const data = await wrapItUp(bookList, listId);

    return redirect(data)
  } catch (e) {
    console.error("Error in wrapped loader:", e);
    return redirect("/", {  // Redirect to home page instead of /error
      status: 302
    });
  }
}