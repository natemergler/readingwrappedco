import { redirect, useLoaderData } from "@remix-run/react";
import { getSession, commitSession, destroySession } from "../sessions";
import { prisma } from "~/db.server";
import { wrapItUp } from "~/lib/wrapItUp.server";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  try {
    const listId = session.get("listId")?.toString();
    if (!listId ) {
      return redirect("/");
    }
    const bookList = await prisma.book.findMany({ where: { listId: listId } });
    const data = await wrapItUp(bookList, listId);
    await prisma.list.update({where: {id: listId}, data: {wrapped: true}});
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
