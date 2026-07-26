"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  { id: "drops", label: "Drops" },
  { id: "about", label: "About" },
  { id: "wholesale", label: "Contact" },
  { id: "find-us", label: "Find Us" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

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
          ? "border-b border-neutral-200 bg-neutral-50/85 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight sm:text-3xl"
        >
          Flora &amp; Flame
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={cn(
                "px-4 py-2 text-md transition-colors duration-200",
                active === id
                  ? // Active state is a weight bump only — 400 → 500.
                    // Subtle enough to read as emphasis, not a different label.
                    "font-medium text-neutral-900"
                  : "font-normal text-neutral-500 hover:text-neutral-900"
              )}
            >
              {label}
            </button>
          ))}

          <Link
            href="/blog"
            className="px-4 py-2 text-lg text-neutral-500 transition-colors duration-200 hover:text-neutral-900"
          >
            Blog
          </Link>

          {/* Disabled until the Stripe work lands. */}
          <span
            aria-disabled="true"
            title="Coming soon"
            className="cursor-not-allowed px-4 py-2 text-lg text-neutral-300"
          >
            Merch
          </span>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          {/* No asChild — SheetTrigger renders its own button and we style
              it directly. Avoids the Radix/React 19 prop inference issue. */}
          <SheetTrigger
            aria-label="Open menu"
            className="inline-flex size-10 items-center justify-center rounded-md transition-colors hover:bg-neutral-200 lg:hidden"
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
                  className="flex items-baseline gap-4 border-b border-neutral-700 py-5 text-left"
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

              <div className="flex items-baseline gap-4 py-5">
                <span className="text-xs tabular-nums text-neutral-600">06</span>
                <span className="font-display text-3xl text-neutral-600">
                  Merch
                </span>
                <span className="text-xs text-neutral-600">soon</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}