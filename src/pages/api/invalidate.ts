import type { APIRoute } from "astro";
// import { VERCEL_REVALIDATE_TOKEN } from "astro:env/server";
import { z } from "zod";

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { tags } = z.object({ tags: z.string().array() }).parse(payload);
    console.log("purging", tags);
    let urls = tags.length === 1 && tags[0] === "all" ? [] : tags;
    console.log("url", request.url);
    for (const url of urls) {
      // const url = new URL(path, new URL(request.url).host)
      // await fetch(url.toString(), { method: "GET", headers: { "x-prerender-revalidate": VERCEL_REVALIDATE_TOKEN } });
    }
    return new Response(JSON.stringify("ok"), { status: 200 });
  } catch (error_) {
    console.error(error_);
    return new Response(JSON.stringify("error"), { status: 500 });
  }
};
