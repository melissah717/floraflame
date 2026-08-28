"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

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
 * Error state: switches to your orange accent (#c25a1c) for border and
 * tinted background, with the error text inline in the label.
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
    if (!v.name.trim()) errs.name = "Required";
    if (!v.email.trim()) errs.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))
      errs.email = "Invalid email";
    if (!v.reason) errs.reason = "Pick one";
    if (!v.message.trim()) errs.message = "Required";
    return errs;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

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
      onSubmit={handleSubmit}
      className="flex flex-col gap-[18px]"
      noValidate
    >
      <div className="grid grid-cols-2 gap-4">
        <Field
          name="name"
          label="Name"
          value={values.name}
          onChange={update}
          error={errors.name}
        />
        <Field
          name="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={update}
          error={errors.email}
        />
      </div>

      <Field
        name="business"
        label="Business name (optional)"
        value={values.business}
        onChange={update}
      />

      <SelectField
        name="reason"
        label="How can we help?"
        value={values.reason}
        onChange={update}
        error={errors.reason}
        options={REASONS}
      />

      <TextareaField
        name="message"
        label="Message"
        value={values.message}
        onChange={update}
        error={errors.message}
        rows={4}
        placeholder="What's going on?"
      />

      <button
        type="submit"
        className="mt-2.5 cursor-pointer rounded-full bg-neutral-50 py-4 text-sm font-medium tracking-[0.02em] text-neutral-900 transition-colors hover:bg-neutral-200"
      >
        Send request
      </button>

      <p className="text-[11px] leading-[1.5] text-neutral-500">
        Opens your email app, addressed to {RECIPIENT}.
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
    "w-full rounded-[12px] px-4 py-3.5 text-sm text-neutral-50 outline-none transition-[background-color,border-color] duration-150 placeholder:text-neutral-600";

  if (error) {
    return `${base} border border-[#c25a1c]/60 bg-[rgba(194,90,28,0.06)] focus:border-[#c25a1c]`;
  }

  return `${base} border border-[rgba(244,242,236,0.08)] bg-[rgba(244,242,236,0.04)] focus:border-[rgba(244,242,236,0.2)] focus:bg-[rgba(244,242,236,0.07)]`;
}

type BaseProps = {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
};

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
        className="mb-1.5 flex items-baseline justify-between text-[11px] font-medium uppercase tracking-[0.06em] text-[#a29886]"
      >
        <span>{label}</span>
        {error && (
          <span className="font-normal normal-case tracking-normal text-[#c25a1c]">
            {error}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
}: BaseProps & { type?: string }) {
  const id = `wholesale-${name}`;
  return (
    <FieldWrapper htmlFor={id} label={label} error={error}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        className={inputClasses(error)}
      />
    </FieldWrapper>
  );
}

function SelectField({
  name,
  label,
  value,
  onChange,
  error,
  options,
}: BaseProps & { options: readonly string[] }) {
  const id = `wholesale-${name}`;
  return (
    <FieldWrapper htmlFor={id} label={label} error={error}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
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
  name,
  label,
  value,
  onChange,
  error,
  rows = 3,
  placeholder,
}: BaseProps & { rows?: number; placeholder?: string }) {
  const id = `wholesale-${name}`;
  return (
    <FieldWrapper htmlFor={id} label={label} error={error}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={!!error}
        className={`${inputClasses(error)} resize-none`}
      />
    </FieldWrapper>
  );
}