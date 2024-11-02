<script lang="ts" module>
  import type { TestimoniesRecord } from "@/lib/pocketbase/schemas";

  // TYPES *********************************************************************************************************************************
  export type TestimoniesItemsProps = { items: Pick<TestimoniesRecord, "author" | "text" | "title">[] };
</script>

<script lang="ts">
  import { fly } from "svelte/transition";

  // PROPS *********************************************************************************************************************************
  let { items }: TestimoniesItemsProps = $props();

  // STYLES ********************************************************************************************************************************
  const cEl = "absolute inset-0 flex-1 flex flex-col items-center justify-center text-center";

  // VARS **********************************************************************************************************************************
  let selected = $state(0);
  let item = $derived(items[selected]);

  $effect(() => {
    const interval = setInterval(() => (selected = (selected + 1) % items.length), 6000);
    return () => clearInterval(interval);
  });
</script>

{#key item}
  <div in:fly={{ y: 400, duration: 1000 }} out:fly={{ y: -400, duration: 1000 }} class={cEl}>
    <article class="max-w-4xl">
      <h5 class="mb-8 text-3xl font-bold italic">{item.title}</h5>
      <div class="mb-4 italic">{@html item.text}</div>
      <p class="font-bold">{item.author}</p>
    </article>
  </div>
{/key}
