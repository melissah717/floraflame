"use server";

import { v2 as cloudinary } from "cloudinary";

import { verifySession } from "@/lib/admin/auth";

/**
 * Signed direct-to-Cloudinary uploads.
 *
 * The browser never sends the file to us — it asks for a signature, then
 * POSTs the file straight to Cloudinary. Two reasons that shape matters:
 *
 *   1. Vercel caps a serverless request body at 4.5 MB. Product photos run
 *      ~3 MB, so proxying them through a route handler would sit right on
 *      that limit and start failing on the first big camera original.
 *
 *   2. It keeps CLOUDINARY_API_SECRET on the server. The alternative —
 *      an unsigned upload preset — needs no secret precisely because the
 *      preset itself is the credential, and anyone who reads it out of the
 *      page can upload into the account.
 *
 * Nothing is compressed on the way in. Cloudinary stores the original and
 * derives per-browser variants at delivery (see lib/cloudinary.ts), which
 * is both smaller and reversible — re-encoding before upload would bake
 * the loss into the master.
 */

export type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

/** Everything uploaded here lands in one folder, so it's easy to find. */
const FOLDER = "floraflame";

export async function signUpload(): Promise<
  { ok: true; data: UploadSignature } | { ok: false; error: string }
> {
  // A signature is permission to write to the Cloudinary account, so this
  // is as sensitive as any other admin mutation.
  await verifySession();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[admin] Cloudinary env vars are not set.");
    return {
      ok: false,
      error:
        "Image upload isn't configured — CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET need to be set. You can still paste a URL.",
    };
  }

  const timestamp = Math.round(Date.now() / 1000);

  /*
   * Only the params Cloudinary actually signs go in here — `file` and
   * `api_key` are excluded by its own rules, and including them produces
   * a signature that fails verification. Whatever IS signed has to be sent
   * with the upload, byte for byte, or the same thing happens.
   */
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: FOLDER },
    apiSecret
  );

  return { ok: true, data: { signature, timestamp, apiKey, cloudName, folder: FOLDER } };
}
