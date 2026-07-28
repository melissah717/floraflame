import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    console.error(
      "Newsletter signup failed: BEEHIIV_API_KEY / BEEHIIV_PUBLICATION_ID are not set."
    );
    return NextResponse.json(
      { error: "Newsletter signup isn't set up yet." },
      { status: 500 }
    );
  }

  const beehiivRes = await fetch(
    `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: "floraandflame.co",
        utm_medium: "footer",
      }),
    }
  );

  if (!beehiivRes.ok) {
    const errorBody = await beehiivRes.json().catch(() => null);
    const message =
      errorBody?.errors?.[0]?.message ?? "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: beehiivRes.status });
  }

  return NextResponse.json({ ok: true });
}
