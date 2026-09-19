"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { savePost, deletePost, type AdminPost } from "@/lib/admin/posts";
import type { BlogParagraph } from "@/lib/blog";
import type { ActionState } from "@/lib/admin/form";
import { ImageField } from "@/components/admin/image-field";
import {
  Banner,
  Checkbox,
  DeleteButton,
  Field,
  FormSection,
  SubmitButton,
  TextArea,
  TextInput,
} from "@/components/admin/ui";

const EMPTY: BlogParagraph = { title: "", image: "", body: "" };

/**
 * The repeater that replaced the sheet's P1..P10 columns.
 *
 * Held in React state rather than rendered from the server row, because the
 * count changes as you edit. Inputs are named `paragraph-{i}-{field}` and
 * the index always runs 0..n-1 with no gaps — lib/admin/form.ts's
 * repeater() reads until the first missing index, so a hole would silently
 * truncate the post.
 */
function ParagraphRepeater({ initial }: { initial: BlogParagraph[] }) {
  const [paragraphs, setParagraphs] = useState<BlogParagraph[]>(
    initial.length ? initial : [EMPTY]
  );

  const update = (index: number, field: keyof BlogParagraph, value: string) =>
    setParagraphs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );

  const move = (index: number, delta: number) =>
    setParagraphs((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="flex flex-col gap-4">
      {paragraphs.map((paragraph, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-neutral-800 bg-neutral-950/60 p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.08em] text-neutral-500">
              Section {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move section ${index + 1} up`}
                className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === paragraphs.length - 1}
                aria-label={`Move section ${index + 1} down`}
                className="rounded px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() =>
                  setParagraphs((prev) =>
                    prev.length === 1 ? [EMPTY] : prev.filter((_, i) => i !== index)
                  )
                }
                aria-label={`Remove section ${index + 1}`}
                className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          </div>

          <Field label="Heading" htmlFor={`paragraph-${index}-title`}>
            <TextInput
              name={`paragraph-${index}-title`}
              value={paragraph.title}
              onChange={(e) => update(index, "title", e.target.value)}
            />
          </Field>

          {/* Controlled, so the repeater's own state stays the source of
              truth and reordering moves the image with its section. */}
          <ImageField
            name={`paragraph-${index}-image`}
            label="Image"
            hint="Optional."
            value={paragraph.image}
            onValueChange={(next) => update(index, "image", next)}
          />

          <Field label="Body" htmlFor={`paragraph-${index}-body`}>
            <TextArea
              name={`paragraph-${index}-body`}
              rows={5}
              value={paragraph.body}
              onChange={(e) => update(index, "body", e.target.value)}
            />
          </Field>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setParagraphs((prev) => [...prev, EMPTY])}
        className="self-start rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50"
      >
        Add section
      </button>
    </div>
  );
}

export function PostForm({ post }: { post: AdminPost | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(savePost, null);
  const errors = state?.fieldErrors ?? {};
  const isNew = !post;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/admin/posts" className="text-xs text-neutral-500 hover:text-neutral-300">
            ← Posts
          </Link>
          <h1 className="font-display text-2xl tracking-[-0.01em]">
            {isNew ? "New post" : post.title}
          </h1>
          {!isNew && (
            <a
              href={`/learn/the-knowledge/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              /learn/the-knowledge/{post.slug} ↗
            </a>
          )}
        </div>

        {!isNew && (
          <form action={deletePost}>
            <input type="hidden" name="id" value={post.id} />
            <DeleteButton confirmText={`Delete “${post.title}”? This can't be undone.`} />
          </form>
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        {!isNew && <input type="hidden" name="id" value={post.id} />}
        <Banner state={state} />

        <FormSection title="Post">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="title" error={errors.title}>
              <TextInput name="title" defaultValue={post?.title ?? ""} error={errors.title} />
            </Field>
            <Field
              label="Slug"
              htmlFor="slug"
              error={errors.slug}
              hint="Leave blank to generate from the title. Set it to keep a URL alive through a retitle."
            >
              <TextInput name="slug" defaultValue={post?.slug ?? ""} error={errors.slug} />
            </Field>
            <Field
              label="Bucket"
              htmlFor="bucket"
              hint="Section heading posts group under on the index."
            >
              <TextInput
                name="bucket"
                defaultValue={post?.bucket ?? "General"}
                placeholder="General"
              />
            </Field>
            <Field label="Sort order" htmlFor="sort_order" hint="Ascending. Ties break by age.">
              <TextInput name="sort_order" type="number" defaultValue={post?.sort_order ?? 0} />
            </Field>
          </div>

          <ImageField
            name="hero_image"
            label="Hero image"
            hint="Optional. Shown on the index card and used for social previews."
            defaultValue={post?.hero_image}
          />

          <Field
            label="Blurb"
            htmlFor="blurb"
            hint="Shown on the index card, and used as the meta description."
          >
            <TextArea name="blurb" rows={3} defaultValue={post?.blurb ?? ""} />
          </Field>

          <Checkbox
            name="published"
            label="Published"
            hint="Unpublished posts are invisible to the public — the database filters them out, not just the UI."
            defaultChecked={post?.published ?? false}
          />
        </FormSection>

        <FormSection
          title="Sections"
          description="The body of the post, in order. No ten-paragraph ceiling any more."
        >
          <ParagraphRepeater initial={post?.paragraphs ?? []} />
        </FormSection>

        <div className="flex items-center gap-3">
          <SubmitButton>{isNew ? "Create post" : "Save changes"}</SubmitButton>
          <Link
            href="/admin/posts"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
