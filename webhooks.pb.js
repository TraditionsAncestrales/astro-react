function sendWebhook({ collection, record }) {
  const devUrl = $os.getenv("ASTRO_POCKETBASE_WEBHOOK_DEV_URL");
  const prodUrl = $os.getenv("ASTRO_POCKETBASE_WEBHOOK_PROD_URL");

  const tags = [collection.name];
  if (record.slug) tags.push(`${collection.name}_${record.slug}`);

  const sendWebhook = (url) => {
    try {
      $http.send({
        url,
        method: "POST",
        body: JSON.stringify({ tags }),
        headers: { "content-type": "application/json" },
      });
      console.log(`Webhook - ${collection.name} - ${record.id} - ${url} : success`);
    } catch (error) {
      console.error(`Webhook - ${collection.name} - ${record.id} - ${url} : ${error.message}`);
    }
  };

  if (prodUrl) sendWebhook(prodUrl);
  if (devUrl) sendWebhook(devUrl);
}

onRecordAfterCreateRequest(sendWebhook);
onRecordAfterUpdateRequest(sendWebhook);
onRecordAfterDeleteRequest(sendWebhook);
