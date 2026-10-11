"use client";

import Link from "next/link";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";

/**
 * Wholesale / press / collab inquiry form — Option E styling.
 *
 * Cream-tinted glassy boxes: each field's background is your ink cream
 * (#f4f2ec) at 4% opacity over the card's dark base. Border is the same
 * cream at 8%. Softer and warmer than a plain solid-filled box — feels
 * like the inputs are made of the same material as the ink text.
 *
 * Focus state: bg lifts to 7%, border to 20% — subtle but clearly active.
 *
 * Error state: switches to the orange accent for border and tinted
 * background, with the error text under the field (tied to it with
 * aria-describedby so screen readers read it with the field).
 *
 * Contrast: borders, placeholder and error text are all set to clear
 * WCAG AA on the dark card (3:1 for borders, 4.5:1 for text). The orange
 * is a lighter #e07a2e for that reason; the brand #c25a1c is too dark to
 * read as text here.
 *
 * Fields: Name, Email, Business (optional), How can we help?, Message.
 * Just the <form> — card, header, description are provided by <LetsTalk>.
 */

const REASONS = [
  "Wholesale / Retail Inquiry",
  "Press",
  "Collaboration",
  "Other",
] as const;

const RECIPIENT = "Matthew@floraandflame.co";

type FormValues = {
  name: string;
  email: string;
  business: string;
  reason: string;
  message: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

const FIELD_ORDER: (keyof FormValues)[] = ["name", "email", "reason", "message"];
const ERROR_TEXT = "text-[#e07a2e]";

const EMPTY: FormValues = {
  name: "",
  email: "",
  business: "",
  reason: "",
  message: "",
};

export function Wholesale() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [summary, setSummary] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const update = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name as keyof FormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (v: FormValues): Errors => {
    const errs: Errors = {};
    if (!v.name.trim()) errs.name = "Enter your name.";
    if (!v.email.trim()) errs.email = "Enter your email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
      errs.email = "Enter a valid email, like you@shop.com.";
    if (!v.reason) errs.reason = "Pick a topic.";
    if (!v.message.trim()) errs.message = "Add a message.";
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    const count = Object.keys(errs).length;
    if (count > 0) {
      setErrors(errs);
      setSummary(`Please fix ${count} ${count === 1 ? "field" : "fields"} to send.`);
      // Move focus to the first problem so keyboard and screen reader
      // users land on it instead of hunting for what went wrong.
      const first = FIELD_ORDER.find((k) => errs[k]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSummary("");

    const bodyLines = [`Name: ${values.name}`, `Email: ${values.email}`];
    if (values.business.trim()) bodyLines.push(`Business: ${values.business}`);
    bodyLines.push(`Reason: ${values.reason}`, "", values.message);

    const subject = `[Flora & Flame] ${values.reason}`;
    const body = bodyLines.join("\n");
    window.location.href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Contact Flora & Flame"
      className="flex flex-col gap-2 sm:gap-3 xl:gap-[18px]"
      noValidate
    >
      <p role="alert" className={`text-sm empty:hidden ${ERROR_TEXT}`}>
        {summary}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Field
          name="name"
          label="Name"
          value={values.name}
          onChange={update}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Field
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={update}
          error={errors.email}
          autoComplete="email"
          required
        />
      </div>

      <Field
        name="business"
        label="Business name (optional)"
        value={values.business}
        onChange={update}
        autoComplete="organization"
      />

      <SelectField
        name="reason"
        label="How can we help?"
        value={values.reason}
        onChange={update}
        error={errors.reason}
        options={REASONS}
        required
      />

      <TextareaField
        name="message"
        label="Message"
        value={values.message}
        onChange={update}
        error={errors.message}
        rows={2}
        placeholder="What's going on?"
        required
      />

      <button
        type="submit"
        className="mt-1.5 cursor-pointer rounded-full bg-neutral-50 py-3 text-base font-medium tracking-[0.02em] text-neutral-900 transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-50 sm:mt-2.5 sm:py-3.5 xl:py-4"
      >
        Send request
      </button>

      <p className="text-[11px] leading-[1.45] text-neutral-400 sm:text-[13px] sm:leading-[1.5]">
        Opens your email app, addressed to {RECIPIENT}. Wholesale is for
        DCC-licensed California businesses; please include your license
        number. See our{" "}
        <Link href="/privacy" className="underline hover:text-neutral-50">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}

// ── field primitives — Option E cream-tinted glassy boxes ─────────────

/**
 * Base input styling — cream tint over dark card. Focus state lifts the
 * background and border opacity so it's clearly active without being loud.
 * Error state swaps to the brand orange for both border and background.
 */
function inputClasses(error?: string): string {
  const base =
    "w-full rounded-[12px] px-3 py-2.5 text-base text-neutral-50 outline-none transition-[background-color,border-color] duration-150 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-50/70 sm:px-3.5 sm:py-3 xl:px-4 xl:py-3.5";

  if (error) {
    return `${base} border border-[#e07a2e] bg-[rgba(194,90,28,0.08)]`;
  }

  return `${base} border border-neutral-500 bg-[rgba(244,242,236,0.04)] focus:border-neutral-50 focus:bg-[rgba(244,242,236,0.07)]`;
}

type BaseProps = {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
};

/** Props every control shares: name/id, value, error wiring, required. */
function controlProps({ name, value, onChange, error, required }: BaseProps) {
  const id = `wholesale-${name}`;
  return {
    id,
    name,
    value,
    onChange,
    required,
    "aria-required": required || undefined,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

function FieldWrapper({
  htmlFor,
  label,
  error,
  children,
}: {
  htmlFor: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#a29886] sm:mb-1.5 sm:text-[13px]"
      >
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className={`mt-1 text-xs sm:text-[13px] ${ERROR_TEXT}`}>
          {error}
        </p>
      )}
    </div>
  );
}

function Field({ type = "text", ...props }: BaseProps & { type?: string }) {
  const control = controlProps(props);
  return (
    <FieldWrapper htmlFor={control.id} label={props.label} error={props.error}>
      <input
        {...control}
        type={type}
        autoComplete={props.autoComplete}
        className={inputClasses(props.error)}
      />
    </FieldWrapper>
  );
}

function SelectField({
  options,
  ...props
}: BaseProps & { options: readonly string[] }) {
  const control = controlProps(props);
  const error = props.error;
  return (
    <FieldWrapper htmlFor={control.id} label={props.label} error={error}>
      <select
        {...control}
        // Custom chevron inline via bg-image so it matches label color and
        // isn't the ugly OS default. Padded right to leave room for it.
        className={`${inputClasses(error)} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22 viewBox=%220 0 10 6%22 fill=%22none%22><path d=%22M1 1l4 4 4-4%22 stroke=%22%238a847a%22 stroke-width=%221.5%22 stroke-linecap=%22round%22/></svg>')] bg-[length:10px_6px] bg-[position:right_16px_center] bg-no-repeat pr-10`}
      >
        <option value="">Select one</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

function TextareaField({
  rows = 3,
  placeholder,
  ...props
}: BaseProps & { rows?: number; placeholder?: string }) {
  const control = controlProps(props);
  return (
    <FieldWrapper htmlFor={control.id} label={props.label} error={props.error}>
      <textarea
        {...control}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClasses(props.error)} resize-none sm:min-h-[104px] xl:min-h-[120px]`}
      />
    </FieldWrapper>
  );
}