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

import { imageHash } from "image-hash";

// Known hash for the default/placeholder Google Books cover image
const PLACEHOLDER_HASH = "ffffffffffffe007e007e007ff9ff81ff83fffff80018001ffffffffffffffff";
const DEFAULT_IMAGE = "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png";

export async function checkImageHash(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    imageHash(
      imageUrl,
      16,
      true,
      (error: Error, data: string) => {
        if (data === PLACEHOLDER_HASH || error) {
          resolve(DEFAULT_IMAGE);
        } else {
          resolve(imageUrl);
        }
      }
    );
  });
}