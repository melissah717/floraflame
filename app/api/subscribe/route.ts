import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function kitError(body: unknown, fallback: string) {
  const b = body as { errors?: unknown[]; error?: string } | null;
  return b?.errors?.[0] ?? b?.error ?? fallback;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const apiKey = process.env.CONVERTKIT_API_KEY;
  const formId = process.env.CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    console.error(
      "Newsletter signup failed: CONVERTKIT_API_KEY / CONVERTKIT_FORM_ID are not set."
    );
    return NextResponse.json(
      { error: "Newsletter signup isn't set up yet." },
      { status: 500 }
    );
  }

  const headers = {
    "X-Kit-Api-Key": apiKey,
    "Content-Type": "application/json",
  };

  // Kit's "add to form" endpoint only attaches an EXISTING subscriber —
  // it 404s for brand-new emails. So a first-time signup needs the
  // subscriber created first, then attached to the form as a second call.
  const createRes = await fetch("https://api.kit.com/v4/subscribers", {
    method: "POST",
    headers,
    body: JSON.stringify({ email_address: email }),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.json().catch(() => null);
    return NextResponse.json(
      { error: kitError(errorBody, "Something went wrong. Try again.") },
      { status: createRes.status }
    );
  }

  const formRes = await fetch(
    `https://api.kit.com/v4/forms/${formId}/subscribers`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ email_address: email }),
    }
  );

  if (!formRes.ok) {
    const errorBody = await formRes.json().catch(() => null);
    return NextResponse.json(
      { error: kitError(errorBody, "Something went wrong. Try again.") },
      { status: formRes.status }
    );
  }

  return NextResponse.json({ ok: true });
}
