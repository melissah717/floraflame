"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // "subscribe"/"wholesale" only exist on the homepage — off it, this just
  // navigates there via the anchor and lets Next's built-in hash-scroll
  // (every section already sets scroll-mt-* for this) land on it once
  // rendered, same as a plain <Link href={`/#${id}`}> would.
  const scrollTo = (id: string) => {
    setOpen(false);
    if (!isHome) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
      // borderBottomColor is set inline, not via the border-neutral-800
      // utility class — something in the cascade (shadcn's base-layer
      // `* { border-color: var(--border) }` reset, using its light-mode
      // value since `.dark` is never toggled on this site) was winning
      // over the utility on this specific element and rendering the strip
      // below the nav as a near-white line instead of black.
      style={{ borderBottomColor: scrolled ? "#000000" : "transparent" }}
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-colors duration-300",
        scrolled ? "bg-neutral-900/85 backdrop-blur-md" : "bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" aria-label="Flora & Flame, home" className="shrink-0">
          <Image
            src="https://res.cloudinary.com/g0mcdcfr/image/upload/v1785517828/text-logo.svg"
            alt="Flora & Flame"
            width={240}
            height={48}
            unoptimized
            priority
            className="h-10 w-auto invert sm:h-12"
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 xl:flex">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 text-lg transition-colors duration-200",
              isHome
                ? "font-medium text-neutral-50"
                : "text-neutral-300 hover:text-neutral-50"
            )}
          >
            Home
          </Link>

          <Link
            href="/strains"
            className="px-4 py-2 text-lg text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
          >
            Strains
          </Link>

          <Link
            href="/learn"
            className={cn(
              "px-4 py-2 text-lg transition-colors duration-200",
              pathname.startsWith("/learn")
                ? "font-medium text-neutral-50"
                : "text-neutral-300 hover:text-neutral-50"
            )}
          >
            Learn
          </Link>

          <Link
            href="/merch"
            className="px-4 py-2 text-lg text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
          >
            Merch
          </Link>

          <Button
            size="lg"
            onClick={() => scrollTo("subscribe")}
            className="ml-4 rounded-full border border-neutral-600 bg-transparent px-6 text-base font-normal text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50"
          >
            Subscribe
          </Button>

          <Button
            size="lg"
            onClick={() => scrollTo("wholesale")}
            className="ml-3 rounded-full bg-neutral-50 px-7 text-base font-normal text-neutral-900 hover:bg-neutral-200"
          >
            Get in touch
          </Button>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          {/* No asChild — SheetTrigger renders its own button and we style
              it directly. Avoids the Radix/React 19 prop inference issue. */}
          <SheetTrigger
            aria-label="Open menu"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-neutral-50 transition-colors hover:bg-neutral-800 xl:hidden"
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-l-0 bg-neutral-900 text-neutral-50 sm:w-96"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-8 flex flex-col px-6 pb-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Home
              </Link>

              <Link
                href="/strains"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Strains
              </Link>

              <Link
                href="/learn"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Learn
              </Link>

              <button
                onClick={() => scrollTo("subscribe")}
                className="cursor-pointer border-b border-neutral-700 py-2.5 text-left font-display text-lg leading-tight text-neutral-50"
              >
                Subscribe
              </button>

              <Link
                href="/merch"
                onClick={() => setOpen(false)}
                className="block py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Merch
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}
