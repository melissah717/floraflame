"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { US_STATES } from "@/lib/us-states";
import { ParallaxText, Reveal, SectionLabel } from "@/components/scroll-primitives";
import { Button } from "@/components/ui/button";

const REQUEST_TO_EMAIL = "Matthew@floraandflame.co";

const HELP_OPTIONS = [
  "Wholesale & retail partnership",
  "Press & media",
  "Collaboration",
  "Product question",
  "General inquiry",
  "Other",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  helpType: string;
  state: string;
  business: string;
  subject: string;
  description: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  helpType: "",
  state: "",
  business: "",
  subject: "",
  description: "",
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9()+\-.\s]{7,}$/;

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = "Enter your name.";

  if (!form.email.trim()) errors.email = "Enter your email.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "Enter a valid email address.";

  if (!form.phone.trim()) errors.phone = "Enter a phone number.";
  else if (!PHONE_RE.test(form.phone.trim())) errors.phone = "Enter a valid phone number.";

  if (!form.helpType) errors.helpType = "Pick one.";
  if (!form.state) errors.state = "Select a state.";
  if (!form.subject.trim()) errors.subject = "Enter a subject.";

  if (!form.description.trim()) errors.description = "Tell us what's going on.";
  else if (form.description.trim().length < 10)
    errors.description = "A little more detail would help, at least 10 characters.";

  return errors;
}

/**
 * Decorative linework flanking the form. Each one tracks the section's own
 * scroll-through progress (0 = section just entering from below, 1 = fully
 * scrolled past above) and windows its slide-in/slide-out around that, so
 * they parallax on as the section arrives and drift off again as it leaves
 * — never just appear/disappear.
 *
 * lg+ only: below that the form fills the width and there's no gutter for
 * them to live in without overlapping it.
 */
const FORM_DECORS_LEFT = [
  { top: "6%", size: 140, inAt: 0.02, rise: 24 },
  { top: "40%", size: 220, inAt: 0.08, rise: -20 },
  { top: "76%", size: 120, inAt: 0.14, rise: 28 },
];
const FORM_DECORS_RIGHT = [
  { top: "12%", size: 180, inAt: 0.05, rise: -22 },
  { top: "48%", size: 130, inAt: 0.11, rise: 30 },
  { top: "80%", size: 170, inAt: 0.17, rise: -16 },
];

function FormDecor({
  side,
  top,
  size,
  inAt,
  rise,
  progress,
}: {
  side: "left" | "right";
  top: string;
  size: number;
  /** Where in the section's 0–1 scroll-through this flower starts sliding in. */
  inAt: number;
  /** Extra vertical drift (px) while onscreen — gives each flower its own parallax speed. */
  rise: number;
  progress: MotionValue<number>;
}) {
  const inEnd = inAt + 0.16;
  const outStart = 0.7 + inAt * 0.6;
  const outEnd = outStart + 0.16;
  const offscreen = side === "left" ? "-160%" : "160%";

  const x = useTransform(
    progress,
    [0, inAt, inEnd, outStart, outEnd, 1],
    [offscreen, offscreen, "0%", "0%", offscreen, offscreen]
  );
  const opacity = useTransform(
    progress,
    [inAt, inEnd, outStart, outEnd],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [0, 1], [rise, -rise]);

  return (
    <motion.div
      aria-hidden
      style={{
        top,
        [side]: "2%",
        x,
        y,
        opacity,
        width: size,
        height: size,
      }}
      className="pointer-events-none absolute z-0 hidden text-neutral-700/50 will-change-transform xl:block"
    >
      <div className="flex h-full w-full items-center justify-center opacity-70">
        <Image
          src="/logo.png"
          alt=""
          width={240}
          height={240}
          className="h-full w-full object-contain invert"
        />
      </div>
    </motion.div>
  );
}

/**
 * No backend on this site, so "sending" the request means handing it to the
 * visitor's own email client via a mailto: link — zero accounts, zero API
 * keys, works today. REQUEST_TO_EMAIL is a placeholder until there's a real
 * inbox to point it at.
 */
export function Wholesale() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: flowerProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const update =
    (key: keyof FormState) =>
      (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm((f) => ({ ...f, [key]: e.target.value }));
        setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
      };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const bodyLines = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      `How can we help: ${form.helpType}`,
      `State: ${form.state}`,
      `Business: ${form.business || "—"}`,
      "",
      form.description,
    ];

    const mailto = `mailto:${REQUEST_TO_EMAIL}?subject=${encodeURIComponent(
      form.subject
    )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    window.location.href = mailto;
    setSent(true);
  };

  return (
    <section
      ref={sectionRef}
      id="wholesale"
      className="scroll-mt-20 relative overflow-hidden bg-neutral-800 px-5 py-24 text-neutral-50 sm:px-8 sm:py-32"
    >
      {!reduce && (
        <>
          {FORM_DECORS_LEFT.map((f, i) => (
            <FormDecor key={`left-${i}`} side="left" progress={flowerProgress} {...f} />
          ))}
          {FORM_DECORS_RIGHT.map((f, i) => (
            <FormDecor key={`right-${i}`} side="right" progress={flowerProgress} {...f} />
          ))}
        </>
      )}

      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal>
          <div className="flex justify-center">
            <SectionLabel number="03">Submit a Request</SectionLabel>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <ParallaxText speed={16}>
            <div className="mx-auto mt-4 flex justify-center">
              <h2 className="max-w-[14ch] text-center font-display text-4xl leading-[1.05] tracking-[-0.01em] text-neutral-50 sm:text-5xl lg:text-6xl">
                Tell us what you need.
              </h2>
            </div>
          </ParallaxText>
        </Reveal>

        <div className="mx-auto mt-16 max-w-2xl">
          <Reveal>
            <p className="text-lg leading-relaxed text-neutral-400">
              Questions about a drop, press, a collab, or getting Flora &amp;
              Flame on your shelf. This goes straight to our inbox.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <form onSubmit={onSubmit} noValidate className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Name"
                  required
                  value={form.name}
                  onChange={update("name")}
                  error={errors.name}
                />
                <Field
                  label="Email"
                  type="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  error={errors.email}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="Phone number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={update("phone")}
                  error={errors.phone}
                />
                <SelectField
                  label="State"
                  required
                  value={form.state}
                  onChange={update("state")}
                  options={US_STATES}
                  placeholder="Select a state"
                  error={errors.state}
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <SelectField
                  label="How can we help you?"
                  required
                  value={form.helpType}
                  onChange={update("helpType")}
                  options={HELP_OPTIONS}
                  placeholder="Select one"
                  error={errors.helpType}
                />
                <Field
                  label="Business name (optional)"
                  value={form.business}
                  onChange={update("business")}
                />
              </div>

              <Field
                label="Subject"
                required
                value={form.subject}
                onChange={update("subject")}
                error={errors.subject}
              />

              <div>
                <label htmlFor="field-description" className="text-xs tracking-[0.04em] text-neutral-400">
                  Description
                </label>
                {/* Plain textarea — shadcn's defaults fight this section's
                    custom underline styling. Not worth the override here. */}
                <textarea
                  id="field-description"
                  required
                  rows={5}
                  value={form.description}
                  onChange={update("description")}
                  placeholder="What's going on?"
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby={errors.description ? "field-description-error" : undefined}
                  className={`mt-2 w-full resize-none border-0 border-b bg-transparent px-0 py-2 text-neutral-50 outline-none transition-colors placeholder:text-neutral-500 ${errors.description
                      ? "border-red-500 focus:border-red-500"
                      : "border-neutral-600 focus:border-neutral-50"
                    }`}
                />
                {errors.description && (
                  <p id="field-description-error" className="mt-1 text-xs text-red-400">
                    {errors.description}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full rounded-full bg-neutral-50 py-6 text-base font-normal text-neutral-900 hover:bg-neutral-200 sm:w-auto sm:px-10"
              >
                {sent ? "Opened your email client, send when ready" : "Send request"}
              </Button>

              <p className="text-xs text-neutral-400">
                Opens your email app, addressed to {REQUEST_TO_EMAIL}.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Deterministic id from a static label string — safe across server/client renders. */
function idFor(label: string) {
  return `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
}

function Field({
  label,
  type = "text",
  required = false,
  value,
  onChange,
  error,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) {
  const id = idFor(label);
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-[0.04em] text-neutral-400">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 w-full border-0 border-b bg-transparent px-0 py-2 text-neutral-50 outline-none transition-colors ${error ? "border-red-500 focus:border-red-500" : "border-neutral-600 focus:border-neutral-50"
          }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
  error?: string;
}) {
  const id = idFor(label);
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-xs tracking-[0.04em] text-neutral-400">
        {label}
      </label>
      <select
        id={id}
        required={required}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a29886'%3E%3Cpath d='M5.5 7.5l4.5 5 4.5-5z'/%3E%3C/svg%3E\")",
          backgroundSize: "14px",
          backgroundPosition: "right 2px center",
          backgroundRepeat: "no-repeat",
        }}
        className={`mt-2 w-full appearance-none border-0 border-b bg-transparent px-0 py-2 pr-6 text-neutral-50 outline-none transition-colors ${error ? "border-red-500 focus:border-red-500" : "border-neutral-600 focus:border-neutral-50"
          }`}
      >
        <option value="" disabled className="text-neutral-500">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
