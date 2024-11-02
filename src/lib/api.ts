import {
  getKnowledgeCollectionSlugPageEntriesRecords,
  getKnowledgeCollectionSlugPageRecords,
  getKnowledgePageEntriesRecords,
  getKnowledgePageRecords,
  getLayoutRecords,
  getShopPageRecords,
} from "@/lib/pocketbase/api";
import {
  entryFromKnowledge,
  entryFromPost,
  entryFromService,
  imageFrom,
  itemFromEvent,
  itemFromKnowledge,
  itemFromPost,
  itemFromProduct,
  itemFromService,
  pathFromKnowledge,
  pathFromPost,
  pathFromService,
  singleFromPost,
  singleFromService,
} from "@/lib/pocketbase/utils";
import type { HelpersFromOpts } from "astro-pocketbase";

// LAYOUT **********************************************************************************************************************************
export async function getLayout(knowledge: string | undefined, isMain: boolean, opts: HelpersFromOpts) {
  const { config, ...data } = await getLayoutRecords(opts);
  const knowledges = data.knowledges.map((knowledge) => itemFromKnowledge(knowledge));
  const organizationPost = itemFromPost(data.organizationPost);

  const theme = knowledge ?? "traditions-ancestrales";
  const isHome = isMain && theme === "traditions-ancestrales";
  const currentKnowledge = knowledges.find(({ slug }) => slug === theme);
  if (!currentKnowledge) throw new Error("Unknown knowledge");
  const otherKnowledges = knowledges.filter(({ slug }) => slug !== theme);
  const hero = { image: currentKnowledge.image, subtitle: config.title, title: currentKnowledge.title };

  return { config, hero, isHome, isMain, organizationPost, otherKnowledges, theme };
}

// KNOWLEDGE PAGE **************************************************************************************************************************
export async function getKnowledgePageEntries(opts: HelpersFromOpts) {
  const { knowledges } = await getKnowledgePageEntriesRecords(opts);
  return knowledges.map((knowledge) => entryFromKnowledge(knowledge));
}

export async function getKnowledgePagePaths(opts: HelpersFromOpts) {
  const { knowledges } = await getKnowledgePageEntriesRecords(opts);
  return knowledges.map((knowledge) => pathFromKnowledge(knowledge));
}

export async function getKnowledgePage(knowledge: string | undefined, opts: HelpersFromOpts) {
  const isHome = knowledge === undefined;
  const { page, ...data } = await getKnowledgePageRecords(knowledge ?? "traditions-ancestrales", opts);
  const events = data.events.map((event) => itemFromEvent(event));
  const post = isHome ? { ...itemFromPost(page.post), title: "Bienvenue" } : itemFromPost(page.post);
  const services = (page.services ?? []).map((service) => itemFromService(service));
  const trainings = services.filter(({ extra: { category } }) => category === "training");
  const workshops = services.filter(({ extra: { category } }) => category === "workshop");
  const consultations = services.filter(({ extra: { category } }) => category === "consult");
  const testimonies = { image: imageFrom(page.testimoniesImage), items: data.testimonies };
  return { consultations, events, post, testimonies, trainings, workshops };
}

// KNOWLEDGE COLLECTION SLUG PAGE **********************************************************************************************************
export async function getKnowledgeCollectionSlugPageEntries(opts: HelpersFromOpts) {
  const { posts, services } = await getKnowledgeCollectionSlugPageEntriesRecords(opts);
  return [...posts.map((post) => entryFromPost(post)), ...services.map((service) => entryFromService(service))];
}

export async function getKnowledgeCollectionSlugPagePaths(opts: HelpersFromOpts) {
  const { posts, services } = await getKnowledgeCollectionSlugPageEntriesRecords(opts);
  return [...posts.map((post) => pathFromPost(post)), ...services.map((service) => pathFromService(service))];
}

export async function getKnowledgeCollectionSlugPage(collection: string, slug: string, opts: HelpersFromOpts) {
  const { single } = await getKnowledgeCollectionSlugPageRecords(collection, slug, opts);
  if (!single) return { single };
  return { single: single.collectionName === "posts" ? singleFromPost(single) : singleFromService(single) };
}

// SHOP PAGE *******************************************************************************************************************************
export async function getShopPage(opts: HelpersFromOpts) {
  const data = await getShopPageRecords(opts);
  const products = data.products.map((product) => itemFromProduct(product));
  return { products };
}
