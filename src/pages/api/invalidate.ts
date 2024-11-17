import type { APIRoute } from "astro";
import { VERCEL_REVALIDATE_TOKEN } from "astro:env/server";
import { z } from "zod";

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload = await request.json();
    const { tags } = z.object({ tags: z.string().array() }).parse(payload);
    console.log("purging", tags);
    let paths = tags.length === 1 && tags[0] === "all" ? [] : tags;
    await Promise.all(
      paths.map(async (path) =>
        fetch(new URL(path, new URL(request.url).origin), { headers: { "x-prerender-revalidate": VERCEL_REVALIDATE_TOKEN } }),
      ),
    );
    return new Response(JSON.stringify("ok"), { status: 200 });
  } catch (error_) {
    console.error(error_);
    return new Response(JSON.stringify("error"), { status: 500 });
  }
};
