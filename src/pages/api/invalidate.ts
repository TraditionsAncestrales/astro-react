import { getLayoutUrls } from "@/lib/api";
import type { APIRoute } from "astro";
import { z } from "zod";

export const POST: APIRoute = async ({ locals: { pocketbase }, request }) => {
  try {
    const payload = await request.json();
    const { tags, token } = z.object({ tags: z.string().array(), token: z.string() }).parse(payload);
    const paths = tags.length === 1 && tags[0] === "all" ? await getLayoutUrls({ pocketbase }) : tags;
    console.log("purging", paths);
    const urls = paths.map((path) => new URL(path, new URL(request.url).origin));
    await Promise.all(urls.map(async (url) => fetch(url, { headers: { "x-prerender-revalidate": token } })));
    return new Response(JSON.stringify("ok"), { status: 200 });
  } catch (error_) {
    console.error(error_);
    return new Response(JSON.stringify("error"), { status: 500 });
  }
};
