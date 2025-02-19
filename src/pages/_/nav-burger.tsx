import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { PropsWithChildren } from "react";
import { tv } from "tailwind-variants";

// STYLES **********************************************************************************************************************************
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

// MAIN **********************************************************************************************************************************
export function NavBurger({ className, children, close, navs }: NavBurgerProps) {
  return (
    <Sheet>
      <SheetTrigger className={ROOT({ className })}>{children}</SheetTrigger>
      <SheetContent icon={close}>
        <SheetHeader>
          <SheetTitle></SheetTitle>
        </SheetHeader>
        {navs.map(({ href, isActive, text }, i) => (
          <a key={i} href={href} className={LINK({ isActive })}>
            {text}
          </a>
        ))}
      </SheetContent>
    </Sheet>
  );
}

// TYPES *********************************************************************************************************************************
export type NavBurgerProps = PropsWithChildren<{
  className: string;
  close?: React.ReactNode;
  navs: { href: string; isActive: boolean; text: string }[];
}>;
