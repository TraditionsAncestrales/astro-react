import { select } from "astro-pocketbase";
import { z } from "zod";
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
} from "./schemas";
import {
  hrefFromKnowledge,
  hrefFromPost,
  hrefFromService,
  imageFrom,
  itemFromEvent,
  itemFromKnowledge,
  itemFromPost,
  itemFromProduct,
  itemFromService,
  type KnowledgeItem,
  singleFromPost,
  singleFromService,
} from "./utils";

// SCHEMAS *********************************************************************************************************************************
export const zConfig = zConfigRecord.omit({ collectionId: true, collectionName: true, created: true, updated: true });
export type Config = z.infer<typeof zConfig>;

export const zImage = select(zImagesRecord, ["alt", "height", "id", "src", "width"]);
export const zKnowledgeSlug = select(zKnowledgesRecord, ["slug"]);
export const zPlacesNames = select(zPlacesRecord, ["name"]).array();

// CONFIG **********************************************************************************************************************************
export const getConfig = async ({ getRecord }: Helpers) => getRecord({ collection: "config", id: "fedcba987654321" }, { schema: zConfig });

// EVENTS **********************************************************************************************************************************
export const getEvents = async ({ getRecords }: Helpers) => {
  const zEvent = select(zEventsRecord, ["excerpt", "from", "name", "slug", "to", "url"], {
    image: zImage,
    places: zPlacesNames,
    service: select(zServicesRecord, ["category", "name", "slug"], { knowledge: zKnowledgeSlug }),
  });
  const { items } = await getRecords("events", { schema: zEvent, sort: "+from" });
  return Promise.all(items.map(itemFromEvent));
};

// KNOWLEDGES ******************************************************************************************************************************
export const getKnowledges = async ({ getRecords }: Helpers) => {
  const zKnowledge = select(zKnowledgesRecord, ["name", "slug", "text"], { image: zImage });
  const { items } = await getRecords("knowledges", { schema: zKnowledge });
  return Promise.all(items.map(itemFromKnowledge));
};

export const getKnowledgeSlugs = async ({ getRecords }: Helpers) => {
  const { items } = await getRecords("knowledges", { schema: zKnowledgeSlug });
  return items;
};

export const getKnowledgeUrls = async (helpers: Helpers) => {
  const knowledges = await getKnowledgeSlugs(helpers);
  return knowledges.map(hrefFromKnowledge);
};

// PAGE ************************************************************************************************************************************
export const getPage = async (slug: string, { getRecord }: Helpers) => {
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
  const page = await getRecord({ collection: "pages", slug }, { schema: zPage });
  const [post, testimoniesImage, ...services] = await Promise.all([
    itemFromPost(page.post),
    imageFrom(page.testimoniesImage),
    ...(page.services ?? []).map(itemFromService),
  ]);
  const trainings = services.filter(({ extra: { category } }) => category === "training");
  const workshops = services.filter(({ extra: { category } }) => category === "workshop");
  const consultations = services.filter(({ extra: { category } }) => category === "consult");
  return { consultations, post, testimoniesImage, trainings, workshops };
};

// POST ************************************************************************************************************************************
export const getPostItem = async (slug: string, { getRecord }: Helpers) => {
  const zPost = select(zPostsRecord, ["excerpt", "slug", "title"], { image: zImage, knowledge: zKnowledgeSlug });
  const post = await getRecord({ collection: "posts", slug }, { schema: zPost });
  return itemFromPost(post);
};

export const getPostSingle = async (slug: string, { getRecord }: Helpers) => {
  const zPost = select(zPostsRecord, ["collectionName", "text", "title"], { image: zImage.optional() });
  const post = await getRecord({ collection: "posts", slug }, { schema: zPost });
  return singleFromPost(post);
};
export type Post = Awaited<ReturnType<typeof getPostSingle>>;

export const getPostUrls = async ({ getRecords }: Helpers) => {
  const zPost = select(zPostsRecord, ["slug"], { knowledge: zKnowledgeSlug });
  const { items } = await getRecords("posts", { schema: zPost });
  return items.map(hrefFromPost);
};

// PRODUCT *********************************************************************************************************************************
export const getProducts = async ({ getRecords }: Helpers) => {
  const zProduct = select(zProductsRecord, ["excerpt", "name", "price", "slug", "url"], { image: zImage });
  const { items } = await getRecords("products", { schema: zProduct });
  return Promise.all(items.map(itemFromProduct));
};

// SERVICE *********************************************************************************************************************************
export const getServiceSingle = async (slug: string, { getRecord }: Helpers) => {
  const zService = select(zServicesRecord, ["collectionName", "duration", "name", "price", "text"], {
    image: zImage,
    places: select(zPlacesRecord, ["name"]).array(),
  });
  const service = await getRecord({ collection: "services", slug }, { schema: zService });
  return singleFromService(service);
};
export type Service = Awaited<ReturnType<typeof getServiceSingle>>;

export const getServiceUrls = async ({ getRecords }: Helpers) => {
  const zService = select(zServicesRecord, ["category", "slug"], { knowledge: zKnowledgeSlug });
  const { items } = await getRecords("services", { schema: zService });
  return items.map(hrefFromService);
};

// TESTIMONY *******************************************************************************************************************************
export const getTestimonies = async ({ getRecords }: Helpers) => {
  const zTestimony = select(zTestimoniesRecord, ["author", "text", "title"]);
  const { items } = await getRecords("testimonies", { schema: zTestimony });
  return items;
};
export type Testimony = Awaited<ReturnType<typeof getTestimonies>>[number];

// UI **************************************************************************************************************************************
export function heroFrom(config: Config, knowledges: KnowledgeItem[], knowledgeSlug: string) {
  const knowledge = knowledges.find(({ slug }) => slug === knowledgeSlug);
  if (!knowledge) throw new Error(`No knowledge found ${knowledge}`);
  return { image: knowledge.image, subtitle: config.title, title: knowledge.title };
}

export function otherKnowledgesFrom(knowledges: KnowledgeItem[], knowledgeSlug: string) {
  return knowledges.filter(({ slug }) => slug !== knowledgeSlug);
}

// URLS ************************************************************************************************************************************
export const getAllUrls = async (helpers: Helpers) => {
  const [knowledgeUrls, postUrls, serviceUrls] = await Promise.all([
    getKnowledgeUrls(helpers),
    getPostUrls(helpers),
    getServiceUrls(helpers),
  ]);
  return [...knowledgeUrls, ...postUrls, ...serviceUrls, "/boutique"];
};

export type Helpers = Pick<App.Locals, "getRecord" | "getRecords">;
