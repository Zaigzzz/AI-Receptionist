import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_ID = process.env.STRIPE_PRICE_STARTER!;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan = "starter" } = await req.json();

  if (!PRICE_ID) {
    return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const userId = (session.user as { id?: string }).id ?? "";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email ?? undefined,
      line_items: [
        { price: PRICE_ID, quantity: 1 },
      ],
      subscription_data: {
        metadata: { userId, plan },
      },
      success_url: `${baseUrl}/dashboard?checkout=success`,
      cancel_url:  `${baseUrl}/#pricing`,
      metadata: { userId, plan },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("Stripe checkout error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
