"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "loading" | "success" | "error";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      setError("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div className="mt-6 max-w-sm" role="status" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
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
          >
            <div
              className={cn(
                "flex items-center gap-1 rounded-full border bg-neutral-800 py-1.5 pr-1.5 pl-5 transition-colors",
                status === "error"
                  ? "border-red-400"
                  : "border-neutral-700 focus-within:border-neutral-50"
              )}
            >
              <input
                type="email"
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
                className="min-w-0 flex-1 border-0 bg-transparent py-1 text-sm text-neutral-50 outline-none placeholder:text-neutral-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                aria-label="Subscribe"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-50 text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>

            <p
              id="newsletter-status-text"
              className={cn(
                "mt-2 pl-5 text-xs",
                status === "error" ? "text-red-400" : "text-neutral-400"
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
