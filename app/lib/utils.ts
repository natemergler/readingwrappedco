import { Session } from "@remix-run/node";
import { clsx, type ClassValue } from "clsx"
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge"
import { prisma } from "~/db.server";
import { createOrUpdateList } from "~/lib/rssParser";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function initializeListId(session: Session, feedUrl: string | null) {
  let randomId = nanoid(8);
  while ((await prisma.list.findUnique({ where: { id: randomId } })) != null) {
    randomId = nanoid(14);
  }
  session.set("listId", randomId);
  await createOrUpdateList(randomId, feedUrl ?? undefined);
}
