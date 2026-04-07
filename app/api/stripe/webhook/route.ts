import { NextResponse } from "next/server";
import Stripe from "stripe";
import { findById, findByEmail, updateUser } from "@/lib/users";
import { Resend } from "resend";

const stripe        = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const resend        = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId  = session.metadata?.userId;
      const plan    = session.metadata?.plan ?? "starter";

      if (userId) {
        const customer = await findById(userId);
        if (customer) {
          await updateUser(userId, {
            plan,
            stripeCustomerId:     session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionStatus:   "active",
          });

          const founderEmail = process.env.FOUNDER_EMAIL;
          if (founderEmail && process.env.RESEND_API_KEY) {
            const planLabel = plan === "pro" ? "Pro ($500 + $150/mo)" : "Starter ($300/mo)";
            await resend.emails.send({
              from:    "ProAnswer <noreply@proanswer.ai>",
              to:      founderEmail,
              subject: `🔔 New Customer: ${customer.name} — ${planLabel}`,
              html: `
                <h2>New ProAnswer Customer</h2>
                <p><strong>Name:</strong> ${customer.name}</p>
                <p><strong>Business:</strong> ${customer.business}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Plan:</strong> ${planLabel}</p>
                <p><strong>User ID:</strong> ${customer.id}</p>
                <hr/>
                <p>Action required: Set up their Vapi assistant and phone number, then add the IDs in the <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin">admin panel</a>.</p>
              `,
            }).catch(() => {});
          }
        }
      }
      break;
    }

    case "customer.subscription.deleted":
    case "customer.subscription.updated": {
      const sub  = event.data.object as Stripe.Subscription;
      const user = await findByEmail(
        (sub.metadata?.email as string) ?? ""
      );
      // Fall back to finding by subscriptionId via a raw query
      if (user) {
        await updateUser(user.id, { subscriptionStatus: sub.status });
      } else {
        // Try matching by stripeSubscriptionId
        const { prisma } = await import("@/lib/prisma");
        const match = await prisma.user.findFirst({
          where: { stripeSubscriptionId: sub.id },
        });
        if (match) await updateUser(match.id, { subscriptionStatus: sub.status });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
