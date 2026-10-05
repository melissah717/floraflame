"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/**
 * Admin form primitives.
 *
 * Plain Tailwind on the site's own neutral palette rather than the shadcn
 * components in components/ui — those are themed off CSS variables that
 * the public site never exercises, and an admin is not the place to find
 * out they render light-on-light. Same greys as the rest of the site, so
 * it reads as part of the same product.
 */

const INPUT_BASE =
  "w-full rounded-lg border bg-neutral-900 px-3 py-2 text-sm text-neutral-50 " +
  "placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-500";

function borderFor(error?: string) {
  return error ? "border-red-500/70" : "border-neutral-700";
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs uppercase tracking-[0.08em] text-neutral-400"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  name,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; error?: string }) {
  return (
    <input
      id={name}
      name={name}
      className={`${INPUT_BASE} ${borderFor(error)}`}
      {...props}
    />
  );
}

export function TextArea({
  name,
  error,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  name: string;
  error?: string;
}) {
  return (
    <textarea
      id={name}
      name={name}
      rows={rows}
      className={`${INPUT_BASE} ${borderFor(error)} resize-y leading-relaxed`}
      {...props}
    />
  );
}

export function Select({
  name,
  options,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  name: string;
  options: readonly string[];
  error?: string;
}) {
  return (
    <select
      id={name}
      name={name}
      className={`${INPUT_BASE} ${borderFor(error)}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option} value={option} className="bg-neutral-900">
          {option}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 shrink-0 accent-lime-400"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm text-neutral-100">{label}</span>
        {hint && <span className="text-xs text-neutral-500">{hint}</span>}
      </span>
    </label>
  );
}

/** Disables itself while the action is in flight, so you can't double-submit. */
export function SubmitButton({
  children = "Save",
  pendingLabel = "Saving…",
}: {
  children?: ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-neutral-50 px-5 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/**
 * Destructive submit with a confirm() gate.
 *
 * Deliberately native rather than a styled modal: there is exactly one
 * admin, and a real dialog here would be more code than the thing it
 * protects. The row is gone for good — there's no trash.
 */
export function DeleteButton({ confirmText }: { confirmText: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
      className="rounded-full border border-red-500/40 px-4 py-2 text-sm text-red-300 transition-colors hover:border-red-500 hover:text-red-200 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function Banner({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state?.message) return null;

  return (
    <p
      role="status"
      className={`rounded-lg border px-3 py-2 text-sm ${
        state.ok
          ? "border-lime-500/40 bg-lime-500/10 text-lime-200"
          : "border-red-500/40 bg-red-500/10 text-red-200"
      }`}
    >
      {state.message}
    </p>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-lg tracking-[-0.01em] text-neutral-50">{title}</h2>
        {description && <p className="text-xs text-neutral-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}
