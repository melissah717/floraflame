"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DockingLogo, dockThreshold } from "@/components/docking-logo";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/utils";

/**
 * Auto-hide nav.
 *   – On the home page, the whole header (bar + links) stays hidden until
 *     the wordmark has docked (scrollY >= dockThreshold()). Then it slides
 *     in and the wordmark + links live together as one piece.
 *   – Off the home page, the header behaves normally from the start.
 *   – Post-dock, wordmark and header share the auto-hide state so they
 *     fade together after HIDE_DELAY of no scroll/hover-near-top.
 */
const HIDE_DELAY = 1500;
const HOVER_ZONE = 80;

const NAV_LINKS = [
  ["Home", "/"],
  ["Strains", "/strains"],
  ["Find Us", "/find-us"],
  ["Learn", "/learn"],
  ["Merch", "/merch"],
] as const;

function isCurrent(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [visible, setVisible] = useState(true);
  const [open, setOpen] = useState(false);
  // Off home: gate is always open (no dock happens there).
  const [dockComplete, setDockComplete] = useState(!isHome);
  // Keyboard users tab into the header while it's hidden off-screen; it
  // has to come back (and stay) while focus is inside it (WCAG 2.4.7).
  const [focusWithin, setFocusWithin] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    /*
     * Auto-hide only where a hover can bring the header back.
     *
     * The hide is predicated on an affordance that only exists with a
     * pointer: move the mouse into the top HOVER_ZONE and the header
     * returns. A touch device emits no pointermove while idle, so once
     * HIDE_DELAY elapsed the header sat at translateY(-80px) opacity 0 —
     * measured — and the only way back was to scroll. Tapping where the
     * hamburger had been did nothing, because it was genuinely off-screen.
     *
     * (hover: hover) is false on touch, so there the header simply stays.
     */
    const hoverMql = window.matchMedia("(hover: hover)");

    const revealAndScheduleHide = () => {
      setVisible(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      if (!hoverMql.matches) return;
      hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
    };

    const onScroll = () => {
      if (isHome) setDockComplete(window.scrollY >= dockThreshold());
      revealAndScheduleHide();
    };

    const onMove = (e: PointerEvent) => {
      if (e.clientY < HOVER_ZONE) revealAndScheduleHide();
    };

    revealAndScheduleHide();
    if (isHome) setDockComplete(window.scrollY >= dockThreshold());

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    // An iPad gaining or losing a trackpad flips this mid-session; re-run
    // so a device that just lost hover doesn't keep a pending hide timer.
    hoverMql.addEventListener("change", revealAndScheduleHide);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      hoverMql.removeEventListener("change", revealAndScheduleHide);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isHome]);

  const wantsNav = visible || open;
  // Header shows only when the wordmark has arrived at its docked home,
  // AND normal auto-hide/hover rules say the nav should be visible.
  const showHeader = (dockComplete && wantsNav) || focusWithin;

  /**
   * Subscribe and Get in touch are real links (#subscribe, /#contact), so
   * they're crawlable and work without JS. When the target is on this
   * page, smooth-scroll to it instead of jumping, then put focus on its
   * first field so a keyboard user lands in the form, not back at the top.
   */
  const jumpTo = (id: string, focusSelector: string) => (e: React.MouseEvent) => {
    setOpen(false);
    const target = document.getElementById(id);
    if (!target) return; // not on this page: let the link navigate
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
    target.querySelector<HTMLElement>(focusSelector)?.focus({ preventScroll: true });
  };
  const toSubscribe = jumpTo("subscribe", 'input[type="email"]');
  const toContact = jumpTo("contact", "input, select, textarea");

  return (
    <>
      {isHome && (
        <DockingLogo
          showWithNav={wantsNav || focusWithin}
          behindMenu={open}
          onFocusChange={setFocusWithin}
        />
      )}

      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: showHeader ? 0 : -80, opacity: showHeader ? 1 : 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onFocus={() => setFocusWithin(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
        }}
        className="fixed top-0 z-50 w-full bg-neutral-900"
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"
        >
          {/* Static wordmark ONLY off the home page — home uses DockingLogo. */}
          {isHome ? (
            <span aria-hidden className="h-10 w-[200px] shrink-0 sm:h-12" />
          ) : (
            <Link href="/" aria-label="Flora & Flame, home" className="shrink-0">
              {/* Same <Wordmark /> the home page docks into. The SVG wraps a
                  full-color raster, so `invert` on an <Image> turned it blue
                  instead of white — the mask approach ignores the source
                  colors entirely and paints the silhouette. */}
              <Wordmark className="h-10 w-[200px] sm:h-12 sm:w-[240px]" color="bg-neutral-50" />
            </Link>
          )}

          {/* Desktop */}
          <div className="hidden items-center gap-1 xl:flex">
            {NAV_LINKS.map(([label, href]) => {
              const current = isCurrent(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "px-4 py-2 text-lg transition-colors duration-200",
                    current
                      ? "font-medium text-neutral-50"
                      : "text-neutral-300 hover:text-neutral-50"
                  )}
                >
                  {label}
                </Link>
              );
            })}

            <a
              href="#subscribe"
              onClick={toSubscribe}
              className={buttonVariants({
                size: "lg",
                className:
                  "ml-4 rounded-full border border-neutral-500 bg-transparent px-6 text-base font-normal text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50",
              })}
            >
              Subscribe
            </a>

            <Link
              href="/#contact"
              onClick={toContact}
              className={buttonVariants({
                size: "lg",
                className:
                  "ml-3 rounded-full bg-neutral-50 px-7 text-base font-normal text-neutral-900 hover:bg-neutral-200",
              })}
            >
              Get in touch
            </Link>
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
              <nav aria-label="Mobile" className="mt-12 flex flex-col px-8 pb-8 sm:px-10">
                {NAV_LINKS.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(pathname, href) ? "page" : undefined}
                    className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
                  >
                    {label}
                  </Link>
                ))}

                <a
                  href="#subscribe"
                  onClick={toSubscribe}
                  className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
                >
                  Subscribe
                </a>

                <Link
                  href="/#contact"
                  onClick={toContact}
                  className="block border-b border-neutral-700 py-4 font-display text-2xl leading-tight text-neutral-50"
                >
                  Get in touch
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </motion.header>
    </>
  );
}