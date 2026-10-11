"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  // Marketing to anyone under 21 is off-limits for a cannabis brand, so
  // the age confirmation is part of the signup itself, not just the gate.
  const [consent, setConsent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);

  const fail = (message: string, focus: HTMLInputElement | null) => {
    setStatus("error");
    setError(message);
    focus?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!EMAIL_RE.test(email.trim())) {
      fail("Enter a valid email address.", emailRef.current);
      return;
    }
    if (!consent) {
      fail("Please confirm you're 21 or older to subscribe.", consentRef.current);
      return;
    }

    // Hidden "website" field: people never see it, form-filling bots do.
    const honeypot = new FormData(e.currentTarget).get("website");

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          ageConfirmed: consent,
          website: honeypot ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="mt-6 max-w-sm">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="status"
            className="flex items-center gap-2.5 rounded-full border border-neutral-50 bg-neutral-50 px-5 py-3 text-sm text-neutral-900"
          >
            <Check className="h-4 w-4 shrink-0" />
            You&apos;re on the list, welcome in.
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onSubmit={onSubmit}
            noValidate
            aria-label="Newsletter signup"
          >
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div
              className={cn(
                "flex items-center gap-1 rounded-full border bg-neutral-800 py-1.5 pr-1.5 pl-5 transition-colors",
                status === "error"
                  ? "border-red-400"
                  : "border-neutral-700 focus-within:border-neutral-50"
              )}
            >
              <input
                ref={emailRef}
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="you@email.com"
                aria-label="Email address"
                aria-invalid={status === "error"}
                aria-describedby="newsletter-status-text"
                disabled={status === "loading"}
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-neutral-50 outline-none placeholder:text-neutral-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-label="Subscribe"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-900 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>

            <label className="mt-3 flex cursor-pointer items-start gap-2.5 pl-5 text-xs leading-relaxed text-neutral-300">
              <input
                ref={consentRef}
                type="checkbox"
                name="ageConfirmed"
                required
                aria-required="true"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (status === "error") setStatus("idle");
                }}
                disabled={status === "loading"}
                className="mt-0.5 h-4 w-4 shrink-0 accent-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50"
              />
              <span>
                I&apos;m 21 or older and want drop emails from Flora &amp;
                Flame. See our{" "}
                <Link href="/privacy" className="underline hover:text-neutral-50">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <p
              id="newsletter-status-text"
              role="status"
              aria-live="polite"
              className={cn(
                "mt-2 pl-5 text-xs",
                status === "error" ? "text-red-300" : "text-neutral-400"
              )}
            >
              {status === "error" ? error : "No spam, just drops. Unsubscribe anytime."}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
