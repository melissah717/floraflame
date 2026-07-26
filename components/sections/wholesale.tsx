"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { WHOLESALE_IMAGE } from "@/lib/data";
import { US_STATES } from "@/lib/us-states";
import { Parallax, Reveal, SectionLabel } from "@/components/scroll-primitives";
import { Button } from "@/components/ui/button";

// TODO: swap for the real business inbox once it exists.
const REQUEST_TO_EMAIL = "email@email.com";

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
    errors.description = "A little more detail would help — at least 10 characters.";

  return errors;
}

/**
 * Dark section. Second contrast break — sits between the light About
 * and the light Find Us, so the page reads light / dark / light / dark / light.
 *
 * No backend on this site, so "sending" the request means handing it to the
 * visitor's own email client via a mailto: link — zero accounts, zero API
 * keys, works today. REQUEST_TO_EMAIL is a placeholder until there's a real
 * inbox to point it at.
 */
export function Wholesale() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sent, setSent] = useState(false);

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
      id="wholesale"
      className="scroll-mt-20 bg-neutral-900 px-5 py-24 text-neutral-50 sm:px-8 sm:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionLabel number="03" tone="light">
            Submit a Request
          </SectionLabel>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-8 max-w-[20ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-6xl">
            However we can help, start here.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <Parallax speed={0.1} className="aspect-[4/3] bg-neutral-800">
              <div className="relative h-[120%] w-full">
                <Image
                  src={WHOLESALE_IMAGE}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Parallax>

            <p className="mt-8 text-lg leading-relaxed text-neutral-400">
              Questions about a drop, press, a collab, or getting Flora &amp;
              Flame on your shelf — this goes straight to our inbox.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <form onSubmit={onSubmit} noValidate className="space-y-6">
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
                <label className="text-xs tracking-[0.04em] text-neutral-400">
                  Description
                </label>
                {/* Plain textarea — shadcn's has light-mode defaults that
                    fight the dark section. Not worth the override here. */}
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={update("description")}
                  placeholder="What's going on?"
                  aria-invalid={Boolean(errors.description)}
                  className={`mt-2 w-full resize-none border-0 border-b bg-transparent px-0 py-2 text-neutral-50 outline-none transition-colors placeholder:text-neutral-600 ${
                    errors.description
                      ? "border-red-500/70 focus:border-red-400"
                      : "border-neutral-700 focus:border-neutral-300"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full rounded-full bg-neutral-50 py-6 text-base font-normal text-neutral-900 hover:bg-neutral-200 sm:w-auto sm:px-10"
              >
                {sent ? "Opened your email client — send when ready" : "Send request"}
              </Button>

              <p className="text-xs text-neutral-500">
                Opens your email app, addressed to {REQUEST_TO_EMAIL}.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
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
  return (
    <div>
      <label className="text-xs tracking-[0.04em] text-neutral-400">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className={`mt-2 w-full border-0 border-b bg-transparent px-0 py-2 text-neutral-50 outline-none transition-colors ${
          error ? "border-red-500/70 focus:border-red-400" : "border-neutral-700 focus:border-neutral-300"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
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
  return (
    <div>
      <label className="text-xs tracking-[0.04em] text-neutral-400">
        {label}
      </label>
      <select
        required={required}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23a29886'%3E%3Cpath d='M5.5 7.5l4.5 5 4.5-5z'/%3E%3C/svg%3E\")",
          backgroundSize: "14px",
          backgroundPosition: "right 2px center",
          backgroundRepeat: "no-repeat",
        }}
        className={`mt-2 w-full appearance-none border-0 border-b bg-transparent px-0 py-2 pr-6 text-neutral-50 outline-none transition-colors [&>option]:bg-neutral-900 ${
          error ? "border-red-500/70 focus:border-red-400" : "border-neutral-700 focus:border-neutral-300"
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
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
