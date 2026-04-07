import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Map plan IDs to Stripe Price IDs — set these in .env.local after creating
// products in your Stripe dashboard (stripe.com/docs/products-prices)
const PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_STARTER!,
  pro:     process.env.STRIPE_PRICE_PRO!,
};

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const userId = (session.user as { id?: string }).id ?? "";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: session.user.email ?? undefined,
      line_items: [
        { price: priceId, quantity: 1 },
        ...(plan === "pro" ? [{
          price_data: {
            currency: "usd",
            product_data: { name: "ProAnswer Pro — One-time Setup Fee" },
            unit_amount: 50000,
          },
          quantity: 1,
        }] : []),
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
