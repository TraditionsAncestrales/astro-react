import { tv } from "tailwind-variants";
import { z } from "zod";

// SCHEMAS *********************************************************************************************************************************
export const zIntent = z.enum(["dark", "light", "primary", "secondary", "white"]);
export type Intent = z.infer<typeof zIntent>;

// export const zTheme = z.enum(["chamanisme", "general", "reki", "reves", "tarot"]);
// export type Theme = z.infer<typeof zTheme>;

// STYLES **********************************************************************************************************************************
export const bg = (intent: Intent) =>
  ({ dark: "bg-neutral-800", light: "bg-neutral-200", primary: "bg-primary", secondary: "bg-secondary", white: "bg-white" })[intent];

export const hoverBg = (intent: Intent) =>
  ({
    dark: "hover:bg-neutral-700",
    light: "hover:bg-neutral-100",
    primary: "hover:bg-primary/80",
    secondary: "hover:bg-neutral-500",
    white: "hover:bg-white",
  })[intent];

export const focusRing = (intent: Intent) =>
  ({
    dark: "focus:ring-neutral-600",
    light: "focus:ring-white",
    primary: "focus:ring-primary-400",
    secondary: "focus:ring-neutral-400",
    white: "focus:ring-white",
  })[intent];

export const disabledBg = (intent: Intent) =>
  ({
    dark: "disabled:bg-neutral-700",
    light: "disabled:bg-neutral-100",
    primary: "disabled:bg-primary-400",
    secondary: "disabled:bg-neutral-500",
    white: "disabled:bg-white",
  })[intent];

export const text = (intent: Intent) =>
  ({ dark: "text-neutral-800", light: "text-neutral-200", primary: "text-primary", secondary: "text-secondary", white: "text-white" })[
    intent
  ];

export const TITLE = tv({ base: `font-heading text-2xl first-letter:text-primary first-letter:text-4xl` });
