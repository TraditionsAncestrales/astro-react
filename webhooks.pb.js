/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable unicorn/no-negated-condition */
/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable unicorn/prefer-switch */
function sendWebhook({ collection, record }) {
  if (!collection || !record) return $app.logger().warn("WEBHOOK - Missing collection or record");
  const impactedItems = getImpactedItems(collection, record);
  const tags = getTags(impactedItems);
  send(tags, collection, record);

  function getImpactedItems(collection, record) {
    let items = [{ collection: collection.name, record }];
    const impactedItems = new Map();

    while (items.length > 0) {
      const { collection, record } = items.shift();
      const slugOrId = record.getString("slug") ?? record.id;

      if (impactedItems.has(collection)) impactedItems.get(collection)?.set(slugOrId, record);
      else impactedItems.set(collection, new Map([[slugOrId, record]]));

      if (collection === "images")
        items = [
          ...items,
          ...itemsFrom(record.id, "events", "image"),
          ...itemsFrom(record.id, "knowledges", "image"),
          ...itemsFrom(record.id, "pages", "testimoniesImage"),
          ...itemsFrom(record.id, "posts", "image"),
          ...itemsFrom(record.id, "products", "image"),
          ...itemsFrom(record.id, "services", "image"),
        ];
      else if (collection === "knowledges")
        items = [
          ...items,
          ...itemsFrom(record.id, "pages", "knowledge"),
          ...itemsFrom(record.id, "posts", "knowledge"),
          ...itemsFrom(record.id, "services", "knowledge"),
        ];
      else if (collection === "places")
        items = [...items, ...itemsFrom(record.id, "events", "places", "~"), ...itemsFrom(record.id, "services", "places", "~")];
      else if (collection === "posts") items = [...items, ...itemsFrom(record.id, "pages", "post")];
      else if (collection === "services")
        items = [...items, ...itemsFrom(record.id, "events", "service"), ...itemsFrom(record.id, "pages", "services", "~")];
    }
    return impactedItems;
  }

  function getTags(items) {
    const tags = new Set();
    if (!(items.has("config") || items.has("knowledges") || (items.has("posts") && items.get("posts").has("l-association")))) {
      if (items.has("products")) tags.add("/boutique");
      if (items.has("pages")) items.get("pages").forEach((record) => tags.add(tagFromPage(record)));
      if (items.has("testimonies")) tags.add("/");
      if (items.has("posts")) items.get("posts").forEach((record) => tags.add(tagFromPost(record)));
      if (items.has("services")) items.get("services").forEach((record) => tags.add(tagFromService(record)));
      if (items.has("events")) {
        tags.add("/");
        items.get("events").forEach((record) => tags.add(tagFromEvent(record)));
      }
    } else tags.add("all");
    return tags;
  }

  function itemsFrom(id, collection, property, comparison = "=") {
    const records = $app.dao().findRecordsByFilter(collection, `${property} ${comparison} {:id}`, "+id", 400, 0, { id });
    return records.filter(Boolean).map((record) => ({ collection, record }));
  }

  function send(tags, collection, record) {
    [$os.getenv("ASTRO_POCKETBASE_WEBHOOK_DEV_URL"), $os.getenv("ASTRO_POCKETBASE_WEBHOOK_PROD_URL")].filter(Boolean).forEach((url) => {
      try {
        const body = JSON.stringify({ tags: [...tags], token: $os.getenv("VERCEL_REVALIDATE_TOKEN") });
        $http.send({ url, method: "POST", body, headers: { "content-type": "application/json" } });
        console.log(`WEBHOOK - ${collection.name} - ${record.id} - ${url} : ${body}`);
      } catch (error) {
        console.error(`WEBHOOK - ${collection.name} - ${record.id} - ${url} : ${error.message}`);
      }
    });
  }

  function tagFromEvent(record) {
    $app.dao().expandRecord(record, ["service.knowledge"], null);
    return tagFromPage(record.expandedOne("service").expandedOne("knowledge"));
  }

  function tagFromPage(record) {
    const slug = record.getString("slug");
    return `/${slug === "traditions-ancestrales" ? "" : slug}`;
  }

  function tagFromPost(record) {
    $app.dao().expandRecord(record, ["knowledge"], null);
    return `/${record.expandedOne("knowledge").getString("slug")}/articles/${record.getString("slug")}`;
  }

  function tagFromService(record) {
    const category = { consult: "consultations", training: "formations", workshop: "ateliers" }[record.getString("category")];
    $app.dao().expandRecord(record, ["knowledge"], null);
    return `/${record.expandedOne("knowledge").getString("slug")}/${category}/${record.getString("slug")}`;
  }
}

onRecordAfterCreateRequest(sendWebhook);
onRecordAfterUpdateRequest(sendWebhook);
onRecordAfterDeleteRequest(sendWebhook);
