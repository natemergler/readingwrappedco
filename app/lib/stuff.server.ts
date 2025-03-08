import { Session } from "@remix-run/node";
import { nanoid } from "nanoid";
import { prisma } from "~/db.server";

export async function initializeListId(session: Session) {
    let randomId = nanoid(8);
    while ((await prisma.list.findUnique({ where: { id: randomId } })) != null) {
      randomId = nanoid(14);
    }
    return randomId;
  }