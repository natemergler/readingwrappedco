import { Form, useLoaderData, redirect } from "@remix-run/react";
import { parseRSS } from "~/lib/rssParser.server";
import { getSession, commitSession } from "../sessions";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { initializeListId } from "~/lib/dbfunctions.server";
import { useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const feedUrl = formData
    .get("feedUrl")
    ?.toString()
    .replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  
  if (!feedUrl) {
    return redirect("/edit", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    // If no session listId exists, create one
    if (!session.get("listId")) {
      const newSessionId = await initializeListId(session);
      session.set("listId", newSessionId);
    }
    
    const sessionId = session.get("listId");
    console.log("Processing feed with session ID:", sessionId);
    
    // Ensure sessionId exists before using it
    if (!sessionId) {
      throw new Error("Session ID is required");
    }
    
    // Parse RSS and get the list of books
    await parseRSS(sessionId as string, feedUrl);
    
    // This is crucial - update the session with the current list ID
    session.set("listId", sessionId);
    session.flash("date", new Date());
    
    return redirect("/edit", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("Error processing RSS feed:", error);
    return Response.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Failed to process the Goodreads URL" 
    });
  }
}

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const sessionTime = session.get("date");

  if (!sessionTime) {
    const newSessionId = await initializeListId(session);
    session.set("listId", newSessionId);

    return Response.json(
      { ok: true },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return Response.json({ ok: true });
}

// Main component
export default function Index() {
  const { ok } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <div className="grid gap-5">
        <Label htmlFor="feedUrl">Reading Wrapped</Label>
        <p className="text-center">
          Enter{" "}
          <a
            href="https://www.goodreads.com/review/list"
            target="_blank"
            className="text-destructive underline"
          >
            your Goodreads URL
          </a>{" "}
          to generate a reading wrap-up. <br />
          or click edit to make an empty list.
        </p>
        <Form method="post" className="gap-2 flex flex-col">
          <Input
            className="w-auto"
            name="feedUrl"
            type="text"
            placeholder="Goodread's RSS URL"
          />
          {navigation.state === "idle" ? (
            <Button type="submit">Edit</Button>
          ) : (
            <Button type="submit" disabled>
              <Loader2 className="animate-spin px-1" />
              Loading
            </Button>
          )}
        </Form>
        {!ok && (
          <div>
            <p className="text-red-500">Please enter a valid book list</p>
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 h-10 w-full p-2">
        <p className="text-center">made with love &lt;3</p>
      </div>
    </div>
  );
}
