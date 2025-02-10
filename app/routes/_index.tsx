import { Form, useLoaderData, json, Link, redirect } from "@remix-run/react";
import { parseRSS } from "~/lib/rssParser.server";
import { getSession, commitSession, destroySession } from "../sessions";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { useNavigation } from "@remix-run/react";
import { Loader2 } from "lucide-react";
import { initializeListId } from "~/lib/stuff.server";
import { cleanFeedContent } from "~/lib/rssParser.server";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const url = new URL(request.url);
  const feedUrl = url.searchParams.get("feedUrl");

  const sessionId = session.get("listId");
  if (!sessionId) {
    const sessionId = await initializeListId(session);
    session.set("listId", sessionId);
  }

  if (feedUrl) {
    try {
      await parseRSS(String(sessionId),feedUrl);
      return redirect("/edit", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    } catch (error) {
      return Response.json({
        ok: false,
      });
    }
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
          Enter <a href="https://www.goodreads.com/review/list" target="_blank" className="text-destructive underline">your Goodreads URL</a> to generate a reading wrap-up. <br />
           or alternatively, click edit to make a list.
          </p>
        <Form action="/" method="get" className="gap-2 flex flex-col">
          <Input
            className="w-auto"
            name="feedUrl"
            type="text"
            placeholder="Goodread's RSS URL"
          />
          {navigation.state === "loading" ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          ) : (
            <Button>Edit</Button>
          )}
        </Form>
        {!ok && <div><p className="text-red-500">Please enter a valid book list</p></div>}
      </div>
      <div className="fixed bottom-0 left-0 h-10 w-full p-2"><p className="text-center">made with love &lt;3</p></div>
    </div>
  );
}


