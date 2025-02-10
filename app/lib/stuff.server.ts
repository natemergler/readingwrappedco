import { Session } from "@remix-run/node";
import { nanoid } from "nanoid";
import { prisma } from "~/db.server";
import { createOrUpdateList } from "./rssParser.server";

export async function initializeListId(session: Session, feedUrl: string | null) {
    let randomId = nanoid(8);
    while ((await prisma.list.findUnique({ where: { id: randomId } })) != null) {
      randomId = nanoid(14);
    }
    session.set("listId", randomId);
    await createOrUpdateList(randomId, feedUrl ?? undefined);
  }