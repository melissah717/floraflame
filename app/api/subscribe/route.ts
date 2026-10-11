import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_ERROR = "Something went wrong. Try again.";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  // Honeypot: the "website" field is invisible to people. A bot that
  // filled it gets a success response so it doesn't retry, and nothing
  // reaches Kit.
  if (typeof body?.website === "string" && body.website !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  // Enforced here too, not just in the form: cannabis marketing can only
  // go to people who've confirmed they're 21+.
  if (body?.ageConfirmed !== true) {
    return NextResponse.json(
      { error: "Please confirm you're 21 or older to subscribe." },
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
      { error: GENERIC_ERROR },
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

  // Kit's error text is logged, not passed through: it can echo account
  // details or confirm whether an address is already subscribed.
  if (!createRes.ok) {
    const errorBody = await createRes.json().catch(() => null);
    console.error("Kit create subscriber failed:", createRes.status, errorBody);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
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
    console.error("Kit add to form failed:", formRes.status, errorBody);
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
