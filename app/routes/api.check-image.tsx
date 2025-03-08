import { json, type ActionFunctionArgs } from "@remix-run/node";
import { imageHash } from "image-hash";

// Known hash for the default/placeholder Google Books cover image
const PLACEHOLDER_HASH = "ffffffffffffe007e007e007ff9ff81ff83fffff80018001ffffffffffffffff";
const DEFAULT_IMAGE = "https://dryofg8nmyqjw.cloudfront.net/images/no-cover.png";

function checkImageHash(imageUrl: string): Promise<string> {
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const imageUrl = formData.get("imageUrl") as string;

  if (!imageUrl) {
    return Response.json({ error: "Image URL is required" }, { status: 400 });
  }

  try {
    const validatedImageUrl = await checkImageHash(imageUrl);
    return Response.json({ imageUrl: validatedImageUrl });
  } catch (error) {
    console.error("Error checking image hash:", error);
    return Response.json({ error: "Failed to process image", imageUrl: DEFAULT_IMAGE }, { status: 500 });
  }
}
