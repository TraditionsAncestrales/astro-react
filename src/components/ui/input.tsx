import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const cEl = `border-input ring-ring/10 outline-ring/50 bg-background flex h-10 w-full min-w-0 rounded-md border px-3 py-2 text-base transition-[color,box-shadow] 
  placeholder:text-muted-foreground 
  selection:bg-primary selection:text-primary-foreground 
  aria-invalid:outline-destructive/60 aria-invalid:ring-destructive/20 aria-invalid:border-destructive/60 aria-invalid:focus-visible:ring-[3px] aria-invalid:focus-visible:outline-none
  focus-visible:ring-4 focus-visible:outline-1 
  disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50  
  md:text-sm`;

  return <input type={type} data-slot="input" className={cn(cEl, className)} {...props} />;
}

export { Input };
