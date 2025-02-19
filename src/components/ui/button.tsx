import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";
import { bg, disabledBg, focusRing, hoverBg, text, type Intent } from "@/styles/ui";

export const btnIntent = (intent: Intent) => [bg(intent), hoverBg(intent), disabledBg(intent), focusRing(intent)].join(" ");

const BUTTON = tv({
  base: `flex items-center font-medium rounded px-5 py-2.5 
    disabled:cursor-not-allowed
    focus:ring-4 focus:outline-none`,
  variants: {
    intent: {
      dark: [text("white"), btnIntent("dark")],
      light: [text("dark"), btnIntent("light")],
      primary: [text("white"), btnIntent("primary")],
      secondary: [text("white"), btnIntent("secondary")],
      white: [text("dark"), btnIntent("white")],
    },
  },
  defaultVariants: { intent: "primary" },
});

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof BUTTON> & { asChild?: boolean };

function Button({ className, intent, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(BUTTON({ intent, className }))} {...props} />;
}

export { Button, BUTTON };
