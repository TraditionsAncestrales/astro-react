import { defineMiddleware } from "astro:middleware";
import { helpersFrom } from "astro-pocketbase";
import PocketBase from "pocketbase";
// @ts-ignore
import Fetch from "@11ty/eleventy-fetch";

const middleware = defineMiddleware((context, next) => {
  const pocketbase = new PocketBase(import.meta.env.PUBLIC_ASTRO_POCKETBASE_URL);
  const { getRecord, getRecords } = helpersFrom({
    pocketbase,
    ...(import.meta.env.DEV
      ? {
          fetch: async (url, fetchOptions) => {
            const { body, ...init } = await Fetch(url, { fetchOptions, returnType: "response", type: "json" });
            return new Response(JSON.stringify(body), init);
          },
        }
      : {}),
  });
  context.locals.pocketbase = pocketbase;
  context.locals.getRecord = getRecord;
  context.locals.getRecords = getRecords;
  return next();
});

// You should NOT change the exported name as it is used by the Astro PocketBase integration.
export { middleware as onRequest };
