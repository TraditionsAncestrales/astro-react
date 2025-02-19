import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  const cEl = `border-input ring-ring/10 outline-ring/50 bg-background flex field-sizing-content min-h-24 w-full rounded-md border px-3 py-2 text-base transition-[color,box-shadow]
  placeholder:text-muted-foreground
  aria-invalid:outline-destructive/60 aria-invalid:ring-destructive/20 aria-invalid:border-destructive/60 aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:outline-none
  focus-visible:ring-4 focus-visible:outline-1 
  disabled:cursor-not-allowed disabled:opacity-50
  md:text-sm`;

  return <textarea data-slot="textarea" className={cn(cEl, className)} {...props} />;
}

export { Textarea };
