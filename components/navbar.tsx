"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "about", label: "About" },
  { id: "drops", label: "Drops" },
  { id: "wholesale", label: "Contact" },
  { id: "find-us", label: "Find Us" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  // The "Home" trigger reads as active when scroll position is inside any
  // of the sections it drops down to, even though the dropdown itself is
  // closed most of the time.
  const homeActive = SECTIONS.some((s) => s.id === active);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setOpen(false);
    // These ids only exist on the homepage — off it, go there first and
    // let Next's built-in hash-scroll (every section already sets
    // scroll-mt-* for this) land on the section once it's rendered.
    if (!isHome) {
      router.push(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.4, ease: "easeOut" }}
      className={cn(
        "fixed top-0 z-50 w-full transition-colors duration-300",
        scrolled
          ? "border-b border-neutral-800 bg-neutral-900/85 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" aria-label="Flora & Flame — home" className="shrink-0">
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
          <MenubarMenu>
            <MenubarTrigger
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-none px-4 py-2 text-lg outline-none transition-colors duration-200 hover:bg-transparent aria-expanded:bg-transparent",
                homeActive
                  ? "font-medium text-neutral-50"
                  : "font-normal text-neutral-300 hover:text-neutral-50"
              )}
            >
              Home
              <ChevronDown className="size-3.5" />
            </MenubarTrigger>
            <MenubarContent className="border border-neutral-700 bg-neutral-900 text-neutral-50">
              {SECTIONS.map(({ id, label }) => (
                <MenubarItem
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={cn(
                    "cursor-pointer text-base focus:bg-neutral-800 focus:text-neutral-50",
                    active === id ? "font-medium text-neutral-50" : "text-neutral-300"
                  )}
                >
                  {label}
                </MenubarItem>
              ))}
            </MenubarContent>
          </MenubarMenu>

          <Link
            href="/learn"
            className={cn(
              "px-4 py-2 text-lg transition-colors duration-200",
              pathname === "/learn"
                ? "font-medium text-neutral-50"
                : "text-neutral-300 hover:text-neutral-50"
            )}
          >
            Learn
          </Link>

          <Link
            href="/blog"
            className="px-4 py-2 text-lg text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
          >
            Blog
          </Link>

          <Link
            href="/archive"
            className="px-4 py-2 text-lg text-neutral-300 transition-colors duration-200 hover:text-neutral-50"
          >
            Archive
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
              <p className="pt-2.5 text-xs uppercase tracking-[0.08em] text-neutral-500">
                Home
              </p>
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="cursor-pointer border-b border-neutral-700 py-2.5 pl-3 text-left font-display text-lg leading-tight text-neutral-50"
                >
                  {label}
                </button>
              ))}

              <Link
                href="/learn"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Learn
              </Link>

              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Blog
              </Link>

              <Link
                href="/archive"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-2.5 font-display text-lg leading-tight text-neutral-50"
              >
                Archive
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
