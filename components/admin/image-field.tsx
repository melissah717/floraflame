"use client";

import { useRef, useState } from "react";

import { signUpload } from "@/lib/admin/upload";
import { Field, TextInput } from "@/components/admin/ui";

/*
 * Only downscale genuinely oversized files. 2600px matches the default in
 * scripts/shrink-images.js, and is well past what any layout on the site
 * asks for.
 *
 * This is NOT compression for delivery's sake — Cloudinary does that far
 * better at request time, per browser. It exists so a 48-megapixel camera
 * original doesn't spend two minutes uploading over hotel wifi. Anything
 * already a sane size is uploaded untouched, so the master stays pristine.
 */
const MAX_DIMENSION = 2600;
const MAX_BYTES = 25 * 1024 * 1024;

async function downscaleIfHuge(file: File): Promise<Blob> {
  // SVGs have no meaningful pixel dimensions and canvas would rasterise
  // them; GIFs would lose their animation. Neither is worth touching.
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Unreadable by the browser — hand it to Cloudinary as-is and let it
    // decide, rather than rejecting something it might well accept.
    return file;
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  if (longest <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }

  const scale = MAX_DIMENSION / longest;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Keep the source type: product shots are PNGs with transparent
  // backgrounds, and re-encoding those to JPEG would fill the alpha black.
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, 0.92)
  );

  return blob ?? file;
}

export function ImageField({
  name,
  label,
  hint,
  error,
  defaultValue,
  value,
  onValueChange,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  defaultValue?: string | null;
  /**
   * Pass value + onValueChange to let a parent own the URL.
   *
   * The paragraph repeater in post-form.tsx has to: reordering sections
   * swaps entries in ITS state, so if the URL only lived in here, moving a
   * section up would carry the old image with the new position and quietly
   * lose the one you just uploaded.
   */
  value?: string;
  onValueChange?: (next: string) => void;
}) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const controlled = value !== undefined;
  const url = controlled ? value : internal;

  const setUrl = (next: string) => {
    if (controlled) onValueChange?.(next);
    else setInternal(next);
  };

  const [progress, setProgress] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setProblem(null);

    if (file.size > MAX_BYTES) {
      setProblem(`That file is ${(file.size / 1024 / 1024).toFixed(1)} MB — 25 MB is the ceiling.`);
      return;
    }

    setProgress(0);

    const signed = await signUpload();
    if (!signed.ok) {
      setProblem(signed.error);
      setProgress(null);
      return;
    }

    const { signature, timestamp, apiKey, cloudName, folder } = signed.data;

    let body: Blob;
    try {
      body = await downscaleIfHuge(file);
    } catch {
      body = file;
    }

    const form = new FormData();
    form.append("file", body, file.name);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("signature", signature);
    // Signed above, so it has to be sent exactly as signed or Cloudinary
    // rejects the request.
    form.append("folder", folder);

    try {
      // XHR rather than fetch: fetch gives no upload progress, and these
      // are multi-megabyte files where a dead-looking button is the
      // difference between waiting and clicking again.
      const result = await new Promise<{ secure_url?: string; error?: { message: string } }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
          };
          xhr.onload = () => {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error(`Cloudinary returned ${xhr.status}`));
            }
          };
          xhr.onerror = () => reject(new Error("Network error talking to Cloudinary"));
          xhr.send(form);
        }
      );

      if (result.error) throw new Error(result.error.message);
      if (!result.secure_url) throw new Error("Cloudinary didn't return a URL");

      setUrl(result.secure_url);
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
      // Reset so picking the SAME file again still fires a change event.
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const uploading = progress !== null;

  return (
    <Field label={label} htmlFor={name} hint={hint} error={problem ?? error}>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          {url ? (
            // Plain <img>: this is a preview of an arbitrary URL someone
            // may have just pasted, and next/image would refuse any host
            // that isn't in next.config.ts remotePatterns.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              className="h-20 w-20 shrink-0 rounded-lg border border-neutral-700 bg-neutral-950 object-contain"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-neutral-700 text-[11px] text-neutral-600">
              No image
            </div>
          )}

          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {/* The real form value. Still editable, so pasting a URL works
                exactly as it did before uploads existed. */}
            <TextInput
              name={name}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Upload a file, or paste a URL"
              error={error}
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50 disabled:opacity-50"
              >
                {uploading ? `Uploading… ${progress}%` : "Upload image"}
              </button>

              {url && !uploading && (
                <button
                  type="button"
                  onClick={() => setUrl("")}
                  className="rounded-full px-2 py-1.5 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {uploading && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-lime-400 transition-[width] duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />
      </div>
    </Field>
  );
}
