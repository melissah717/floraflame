"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  // Every page is dark except the Hero's own sticky top section — its
  // background has to stay light for the mix-blend-difference title
  // effect to work (see hero.tsx). While the transparent navbar sits over
  // that one light section, it needs dark-on-light text instead of its
  // usual light-on-dark set, or it reads as invisible.
  const overLightHero = isHome && !scrolled;

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
            className={cn("h-10 w-auto transition-[filter] duration-300 sm:h-12", !overLightHero && "invert")}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 xl:flex">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={cn(
                "cursor-pointer px-4 py-2 text-md transition-colors duration-200",
                active === id
                  ? // Active state is a weight bump only — 400 → 500.
                  // Subtle enough to read as emphasis, not a different label.
                  cn("font-medium", overLightHero ? "text-neutral-900" : "text-neutral-50")
                  : cn(
                      "font-normal",
                      overLightHero
                        ? "text-neutral-500 hover:text-neutral-900"
                        : "text-neutral-300 hover:text-neutral-50"
                    )
              )}
            >
              {label}
            </button>
          ))}

          <Link
            href="/blog"
            className={cn(
              "px-4 py-2 text-lg transition-colors duration-200",
              overLightHero
                ? "text-neutral-500 hover:text-neutral-900"
                : "text-neutral-300 hover:text-neutral-50"
            )}
          >
            Blog
          </Link>

          <Link
            href="/archive"
            className={cn(
              "px-4 py-2 text-lg transition-colors duration-200",
              overLightHero
                ? "text-neutral-500 hover:text-neutral-900"
                : "text-neutral-300 hover:text-neutral-50"
            )}
          >
            Archive
          </Link>

          <Link
            href="/merch"
            className={cn(
              "px-4 py-2 text-lg transition-colors duration-200",
              overLightHero
                ? "text-neutral-500 hover:text-neutral-900"
                : "text-neutral-300 hover:text-neutral-50"
            )}
          >
            Merch
          </Link>

          <Button
            size="lg"
            onClick={() => scrollTo("subscribe")}
            className={cn(
              "ml-4 rounded-full border bg-transparent px-6 text-base font-normal",
              overLightHero
                ? "border-neutral-300 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                : "border-neutral-600 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50"
            )}
          >
            Subscribe
          </Button>

          <Button
            size="lg"
            onClick={() => scrollTo("wholesale")}
            className={cn(
              "ml-3 rounded-full px-7 text-base font-normal",
              overLightHero
                ? "bg-neutral-900 text-neutral-50 hover:bg-neutral-700"
                : "bg-neutral-50 text-neutral-900 hover:bg-neutral-200"
            )}
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
            className={cn(
              "inline-flex size-10 cursor-pointer items-center justify-center rounded-md transition-colors xl:hidden",
              overLightHero
                ? "text-neutral-900 hover:bg-neutral-200"
                : "text-neutral-50 hover:bg-neutral-800"
            )}
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full border-l-0 bg-neutral-900 sm:w-96"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-16 flex flex-col gap-1 px-6">
              {SECTIONS.map(({ id, label }, i) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="flex cursor-pointer items-baseline gap-4 border-b border-neutral-700 py-5 text-left"
                >
                  <span className="text-xs tabular-nums text-neutral-500">
                    0{i + 1}
                  </span>
                  <span className="font-display text-3xl text-neutral-50">
                    {label}
                  </span>
                </button>
              ))}

              <Link
                href="/blog"
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-neutral-700 py-5"
              >
                <span className="text-xs tabular-nums text-neutral-500">05</span>
                <span className="font-display text-3xl text-neutral-50">
                  Blog
                </span>
              </Link>

              <Link
                href="/archive"
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 border-b border-neutral-700 py-5"
              >
                <span className="text-xs tabular-nums text-neutral-500">06</span>
                <span className="font-display text-3xl text-neutral-50">
                  Archive
                </span>
              </Link>

              <button
                onClick={() => scrollTo("subscribe")}
                className="flex cursor-pointer items-baseline gap-4 border-b border-neutral-700 py-5 text-left"
              >
                <span className="text-xs tabular-nums text-neutral-500">07</span>
                <span className="font-display text-3xl text-neutral-50">
                  Subscribe
                </span>
              </button>

              <Link
                href="/merch"
                onClick={() => setOpen(false)}
                className="flex items-baseline gap-4 py-5"
              >
                <span className="text-xs tabular-nums text-neutral-500">08</span>
                <span className="font-display text-3xl text-neutral-50">
                  Merch
                </span>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}