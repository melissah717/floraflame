"use client";

import { useEffect, useRef, useState } from "react";
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

/**
 * Nav shows while the user is actively scrolling, then hides HIDE_DELAY ms
 * after they stop. Two escape hatches so people can't get stranded:
 *   – Mouse within HOVER_ZONE px of the top reveals it (desktop)
 *   – An open mobile menu forces it visible
 * Nav is also visible on first load (with the timer already running), so a
 * fresh visitor sees it exists before it slips away.
 */
const HIDE_DELAY = 500;   // ms — dial up for longer lingers
const HOVER_ZONE = 80;     // px — how close to the top counts as "near"

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true); // visible on first load
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const revealAndScheduleHide = () => {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      revealAndScheduleHide();
    };

    // Desktop-only in practice — pointermove near the top edge counts as
    // "I want the nav back." Touch devices don't fire this while idle.
    const onMove = (e: PointerEvent) => {
      if (e.clientY < HOVER_ZONE) revealAndScheduleHide();
    };

    // Start the hide countdown on mount, so if the visitor doesn't scroll
    // for HIDE_DELAY ms the nav folds away as intended.
    revealAndScheduleHide();

    // Sync the scrolled bg on mount in case we've hydrated mid-page.
    setScrolled(window.scrollY > 24);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  // Keep the nav open while the mobile sheet is open — hiding the sheet's
  // trigger would leave an open panel with no anchor and no way to close.
  const showNav = visible || open;

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    setOpen(false);

    if (isHome) {
      document.getElementById("wholesale")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    router.push("/#wholesale");
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: showNav ? 0 : -80, opacity: showNav ? 1 : 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      // borderBottomColor inline for the same shadcn-cascade reason as before.
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
            onClick={scrollToContact}
            className="ml-3 rounded-full bg-neutral-50 px-7 text-base font-normal text-neutral-900 hover:bg-neutral-200"
          >
            Get in touch
          </Button>
        </div>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-neutral-50 transition-colors hover:bg-neutral-800 xl:hidden"
          >
            <Menu className="size-6" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-l-0 bg-neutral-900 text-neutral-50 sm:w-[28rem]"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="mt-12 flex flex-col px-8 pb-8 sm:px-10">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
              >
                Home
              </Link>

              <Link
                href="/strains"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
              >
                Strains
              </Link>

              <Link
                href="/learn"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
              >
                Learn
              </Link>

              <Link
                href="/merch"
                onClick={() => setOpen(false)}
                className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
              >
                Merch
              </Link>

              <button
                onClick={() => scrollTo("subscribe")}
                className="cursor-pointer border-b border-neutral-700 py-4 text-left font-display text-2xl leading-tight text-neutral-50"
              >
                Subscribe
              </button>

              <button
                onClick={scrollToContact}
                className="cursor-pointer border-b border-neutral-700 py-4 text-left font-display text-2xl leading-tight text-neutral-50"
              >
                Get in touch
              </button>

            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}