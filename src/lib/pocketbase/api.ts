import { type HelpersFromOpts, helpersFrom, select } from "astro-pocketbase";

import {
  zConfigRecord,
  zEventsRecord,
  zImagesRecord,
  zKnowledgesRecord,
  zPagesRecord,
  zPlacesRecord,
  zPostsRecord,
  zProductsRecord,
  zServicesRecord,
  zTestimoniesRecord,
} from "@/lib/pocketbase/schemas";

// SHARED **********************************************************************************************************************************
export const toOmit = { collectionId: true, collectionName: true, created: true, updated: true } as const;
export const zImage = select(zImagesRecord, ["alt", "height", "id", "src", "width"]);
export const zKnowledgeSlug = select(zKnowledgesRecord, ["slug"]);
export const zPlacesNames = select(zPlacesRecord, ["name"]).array();

// LAYOUT **********************************************************************************************************************************
export async function getLayoutRecords(opts: HelpersFromOpts) {
  const { getRecord, getRecords } = helpersFrom(opts);

  const zConfig = zConfigRecord.omit(toOmit);
  const zKnowledge = select(zKnowledgesRecord, ["name", "slug", "text"], { image: zImage });
  const zPost = select(zPostsRecord, ["excerpt", "slug", "title"], { image: zImage, knowledge: zKnowledgeSlug });

  const [config, { items: knowledges }, organizationPost] = await Promise.all([
    getRecord({ collection: "config", id: "fedcba987654321" }, { schema: zConfig }),
    getRecords("knowledges", { schema: zKnowledge }),
    getRecord({ collection: "posts", slug: "l-association" }, { schema: zPost }),
  ]);

  return { config, knowledges, organizationPost };
}

// KNOWLEDGE PAGE **************************************************************************************************************************
export async function getKnowledgePageEntriesRecords(opts: HelpersFromOpts) {
  const { getRecords } = helpersFrom(opts);

  const { items: knowledges } = await getRecords("knowledges", { schema: zKnowledgeSlug });

  return { knowledges };
}

export async function getKnowledgePageRecords(knowledge: string, opts: HelpersFromOpts) {
  const { getRecord, getRecords } = helpersFrom(opts);

  const zEvent = select(zEventsRecord, ["excerpt", "from", "name", "slug", "to", "url"], {
    image: zImage,
    places: zPlacesNames,
    service: select(zServicesRecord, ["category", "name", "slug"], { knowledge: zKnowledgeSlug }),
  });

  const eventFilter = knowledge !== "traditions-ancestrales" ? `service.knowledge.slug="${knowledge}"` : "";

  const zPage = select(zPagesRecord, [], {
    post: select(zPostsRecord, ["excerpt", "slug", "title"], {
      image: zImage,
      knowledge: zKnowledgeSlug,
    }),
    services: select(zServicesRecord, ["category", "duration", "excerpt", "name", "price", "slug"], {
      image: zImage,
      knowledge: zKnowledgeSlug,
      places: zPlacesNames,
    })
      .array()
      .optional(),
    testimoniesImage: zImage.optional(),
  });

  const zTestimony = select(zTestimoniesRecord, ["author", "text", "title"]);

  const [{ items: events }, page, { items: testimonies }] = await Promise.all([
    getRecords("events", { schema: zEvent, filter: eventFilter, sort: "+from" }),
    getRecord({ collection: "pages", slug: knowledge }, { schema: zPage }),
    knowledge === "traditions-ancestrales" ? getRecords("testimonies", { schema: zTestimony }) : { items: [] },
  ]);

  return { events, page, testimonies };
}

// KNOWLEDGE COLLECTION SLUG PAGE **********************************************************************************************************
export async function getKnowledgeCollectionSlugPageEntriesRecords(opts: HelpersFromOpts) {
  const { getRecords } = helpersFrom(opts);

  const zPost = select(zPostsRecord, ["slug"], { knowledge: zKnowledgeSlug });
  const zService = select(zServicesRecord, ["category", "slug"], { knowledge: zKnowledgeSlug });

  const [{ items: posts }, { items: services }] = await Promise.all([
    getRecords("posts", { schema: zPost }),
    getRecords("services", { schema: zService }),
  ]);
  return { posts, services };
}

export async function getKnowledgeCollectionSlugPageRecords(collection: string, slug: string, opts: HelpersFromOpts) {
  const { getRecord } = helpersFrom(opts);

  const zPost = select(zPostsRecord, ["collectionName", "text", "title"], { image: zImage.optional() });

  const zService = select(zServicesRecord, ["collectionName", "duration", "name", "price", "text"], {
    image: zImage,
    places: select(zPlacesRecord, ["name"]).array(),
  });

  const single = await (collection === "articles"
    ? getRecord({ collection: "posts", slug }, { schema: zPost })
    : getRecord({ collection: "services", slug }, { schema: zService }));

  return { single };
}

// SHOP PAGE *******************************************************************************************************************************
export async function getShopPageRecords(opts: HelpersFromOpts) {
  const { getRecords } = helpersFrom(opts);

  const zProduct = select(zProductsRecord, ["excerpt", "name", "price", "slug", "url"], { image: zImage });

  const { items: products } = await getRecords("products", { schema: zProduct });

  return { products };
}
