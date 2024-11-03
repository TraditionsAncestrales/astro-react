<script lang="ts" module>
  // STYLES ********************************************************************************************************************************
  const NAV_BURGER = tv({
    slots: {
      ROOT: `p-2 text-sm text-neutral-800 rounded hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-200`,
      LINK: `hover:bg-primary block p-4 px-8 font-bold uppercase text-black hover:text-white`,
    },
    variants: {
      isActive: {
        true: { LINK: `bg-primary text-white` },
      },
    },
  });

  const { LINK, ROOT } = NAV_BURGER();

  // TYPES *********************************************************************************************************************************
  export type NavBurgerProps = {
    children: Snippet;
    class: string;
    navs: { href: string; isActive: boolean; text: string }[];
  };
</script>

<script lang="ts">
  import * as Sheet from "@/components/ui/sheet";
  import type { Snippet } from "svelte";
  import { tv } from "tailwind-variants";

  // PROPS *********************************************************************************************************************************
  let { class: className, children, navs }: NavBurgerProps = $props();
</script>

<Sheet.Root>
  <Sheet.Trigger class={ROOT({ className })}>{@render children()}</Sheet.Trigger>
  <Sheet.Content>
    {#each navs as { href, isActive, text }}
      <a {href} class={LINK({ isActive })}>{text}</a>
    {/each}
  </Sheet.Content>
</Sheet.Root>
