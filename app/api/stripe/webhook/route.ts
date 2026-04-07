import { NextResponse } from "next/server";
import Stripe from "stripe";
import { findById, findByEmail, updateUser } from "@/lib/users";
import { Resend } from "resend";
import { emailLayout } from "@/lib/email";

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
              from:    "ProAnswer <noreply@proanswer.dev>",
              to:      founderEmail,
              subject: `New Customer: ${customer.name} — ${planLabel}`,
              html: emailLayout({
                preheader: `New customer: ${customer.name} signed up for ${planLabel}`,
                body: `
                  <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#09090b;">New Customer</h1>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border-radius:12px;border:1px solid #f4f4f5;margin-bottom:24px;">
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Name</span><br/><strong style="color:#09090b;">${customer.name}</strong></td></tr>
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Business</span><br/><strong style="color:#09090b;">${customer.business}</strong></td></tr>
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Email</span><br/><strong style="color:#09090b;">${customer.email}</strong></td></tr>
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Plan</span><br/><strong style="color:#09090b;">${planLabel}</strong></td></tr>
                    <tr><td style="padding:14px 20px;font-size:14px;"><span style="color:#a1a1aa;">User ID</span><br/><span style="color:#71717a;font-family:monospace;font-size:12px;">${customer.id}</span></td></tr>
                  </table>
                  <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                    <strong>Action required:</strong> Set up their Vapi assistant and phone number, then add the IDs in the <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="color:#09090b;font-weight:600;text-decoration:underline;">admin panel</a>.
                  </p>
                `,
              }),
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

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as { subscription: string }).subscription;
      if (subId) {
        const { prisma } = await import("@/lib/prisma");
        const match = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subId },
        });
        if (match) {
          await updateUser(match.id, { subscriptionStatus: "past_due" });

          const founderEmail = process.env.FOUNDER_EMAIL;
          if (founderEmail && process.env.RESEND_API_KEY) {
            await resend.emails.send({
              from:    "ProAnswer <noreply@proanswer.dev>",
              to:      founderEmail,
              subject: `Payment Failed: ${match.name}`,
              html: emailLayout({
                preheader: `Payment failed for ${match.name}`,
                body: `
                  <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#dc2626;">Payment Failed</p>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border-radius:12px;border:1px solid #f4f4f5;margin-bottom:24px;">
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Name</span><br/><strong style="color:#09090b;">${match.name}</strong></td></tr>
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Email</span><br/><strong style="color:#09090b;">${match.email}</strong></td></tr>
                    <tr><td style="padding:14px 20px;font-size:14px;"><span style="color:#a1a1aa;">Business</span><br/><strong style="color:#09090b;">${match.business}</strong></td></tr>
                  </table>
                  <p style="margin:0;font-size:14px;color:#52525b;line-height:1.6;">
                    Stripe will retry automatically. If it continues to fail, the subscription will be canceled.
                  </p>
                `,
              }),
            }).catch(() => {});
          }
        }
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const customerId = charge.customer as string;
      if (customerId) {
        const { prisma } = await import("@/lib/prisma");
        const match = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (match) {
          const founderEmail = process.env.FOUNDER_EMAIL;
          if (founderEmail && process.env.RESEND_API_KEY) {
            const amountRefunded = (charge.amount_refunded / 100).toFixed(2);
            await resend.emails.send({
              from:    "ProAnswer <noreply@proanswer.dev>",
              to:      founderEmail,
              subject: `Refund Processed: ${match.name} — $${amountRefunded}`,
              html: emailLayout({
                preheader: `Refund of $${amountRefunded} processed for ${match.name}`,
                body: `
                  <h1 style="margin:0 0 20px;font-size:22px;font-weight:800;color:#09090b;">Refund Processed</h1>
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border-radius:12px;border:1px solid #f4f4f5;margin-bottom:24px;">
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Name</span><br/><strong style="color:#09090b;">${match.name}</strong></td></tr>
                    <tr><td style="padding:14px 20px;border-bottom:1px solid #f4f4f5;font-size:14px;"><span style="color:#a1a1aa;">Email</span><br/><strong style="color:#09090b;">${match.email}</strong></td></tr>
                    <tr><td style="padding:14px 20px;font-size:14px;"><span style="color:#a1a1aa;">Amount Refunded</span><br/><strong style="color:#09090b;font-size:20px;">$${amountRefunded}</strong></td></tr>
                  </table>
                `,
              }),
            }).catch(() => {});
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
