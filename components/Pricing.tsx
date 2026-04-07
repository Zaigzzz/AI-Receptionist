"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Check, X, Lock, ArrowRight,
  Loader2, Shield, RefreshCw
} from "lucide-react";

type Plan = {
  id: string;
  name: string;
  setup: string;
  setupLabel: string;
  monthly: string;
  description: string;
  features: string[];
  highlight: boolean;
  badge: string | null;
  total: string;
  ctaLabel: string;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    setup: "$0",
    setupLabel: "No setup fee",
    monthly: "$300",
    description: "Get started immediately — no upfront cost.",
    features: [
      "Up to 100 calls/month",
      "Basic AI receptionist script",
      "Email call summaries",
      "1 business phone number",
      "Standard response time",
      "Email support",
    ],
    highlight: false,
    badge: null,
    total: "$300/month",
    ctaLabel: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    setup: "$500",
    setupLabel: "One-time setup fee",
    monthly: "$150",
    description: "Full setup, custom voice, and unlimited calls.",
    features: [
      "Unlimited calls",
      "Custom AI script & brand voice",
      "SMS + email call summaries",
      "2 business phone numbers",
      "Appointment booking",
      "Priority support",
      "Google Calendar integration",
    ],
    highlight: true,
    badge: "Most Popular",
    total: "$500 today, then $150/month",
    ctaLabel: "Get Started",
  },
];

function CheckoutModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    // Not logged in — send to login first, return to pricing after
    if (status === "unauthenticated" || !session) {
      window.location.href = `/auth/login?callbackUrl=${encodeURIComponent("/#pricing")}`;
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-full bg-[#09090b]" />

        <div className="px-7 pt-6 pb-7">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-1">Get Started</p>
              <h3 className="font-display text-xl font-extrabold text-zinc-900">ProAnswer {plan.name}</h3>
            </div>
            <button onClick={onClose} suppressHydrationWarning
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors text-zinc-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Plan summary */}
          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-4 mb-6">
            {plan.id === "pro" ? (
              <>
                <p className="text-zinc-900 font-bold text-sm">$500 <span className="font-normal text-zinc-500">one-time setup</span></p>
                <p className="text-zinc-500 text-sm mt-0.5">then $150/month — unlimited calls</p>
              </>
            ) : (
              <p className="text-zinc-900 font-bold text-sm">$300<span className="font-normal text-zinc-500">/month · up to 100 calls</span></p>
            )}
            <p className="text-zinc-400 text-xs mt-2">No contracts · Cancel anytime</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleCheckout}
            disabled={loading}
            suppressHydrationWarning
            className="w-full bg-[#09090b] hover:bg-zinc-800 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Redirecting to checkout…</>
            ) : (
              <><Lock className="w-4 h-4" />Continue to Secure Checkout</>
            )}
          </button>

          <div className="flex items-center justify-center gap-4 mt-4">
            {[
              { icon: Shield, label: "256-bit SSL" },
              { icon: Lock, label: "Stripe Secured" },
              { icon: RefreshCw, label: "Cancel Anytime" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1 text-zinc-400">
                <Icon className="w-3 h-3" />
                <span className="text-[10px] font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StarterCard({ plan, index, onSelect }: { plan: Plan; index: number; onSelect: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className="relative flex flex-col rounded-3xl p-8 bg-white border border-zinc-200 hover:border-zinc-400 hover:shadow-xl hover:shadow-black/5 transition-all duration-300 group"
    >
      <div className="mb-6">
        <span className="inline-block bg-zinc-100 text-zinc-600 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-zinc-200">
          Starter
        </span>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-zinc-500 font-semibold text-sm bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
            ✓ {plan.setupLabel}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="font-display text-6xl font-extrabold text-zinc-900 tracking-tight">$300</span>
          <span className="text-zinc-400 font-medium text-lg">/mo</span>
        </div>
        <p className="text-zinc-500 text-sm">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <motion.li
            key={f}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 + i * 0.06 }}
            className="flex items-center gap-3 text-sm text-zinc-500"
          >
            <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-200 transition-colors">
              <Check className="w-3 h-3 text-zinc-700" strokeWidth={3} />
            </div>
            <span className="font-medium">{f}</span>
          </motion.li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className="w-full py-4 rounded-2xl font-bold text-base border border-zinc-200 text-zinc-700 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 transition-all group/btn flex items-center justify-center gap-2"
      >
        Get Started
        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function ProCard({ plan, index, onSelect }: { plan: Plan; index: number; onSelect: () => void }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="relative"
    >
      {/* Most Popular badge */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-[#09090b] text-white font-bold text-xs px-5 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
          Most Popular
        </div>
      </div>

      {/* Card */}
      <div className="relative bg-[#09090b] rounded-3xl p-8 shadow-2xl shadow-black/20">
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 rounded-3xl opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          <div className="mb-6">
            <span className="inline-block bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 border border-white/20">
              Pro
            </span>

            <div className="flex flex-col gap-1 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-display text-white font-extrabold text-2xl">$500</span>
                <span className="text-zinc-400 text-sm font-medium">one-time setup</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-6xl font-extrabold text-white tracking-tight">$150</span>
                <span className="text-zinc-400 font-medium text-lg">/mo after</span>
              </div>
            </div>
            <p className="text-zinc-400 text-sm">{plan.description}</p>
          </div>

          <ul className="space-y-3 mb-8">
            {plan.features.map((f, i) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-center gap-3 text-sm text-zinc-300"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="font-semibold">{f}</span>
              </motion.li>
            ))}
          </ul>

          <button
            onClick={onSelect}
            suppressHydrationWarning
            className="w-full py-4 rounded-2xl font-bold text-base bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
          >
            Get Started
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-zinc-500 mt-3">
            Setup completed within 24 hours
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-50px" });

  return (
    <>
      <AnimatePresence>
        {selectedPlan && (
          <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
        )}
      </AnimatePresence>

      <section id="pricing" className="py-28 bg-white border-b border-zinc-100 relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #09090b 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            ref={headingRef}
            initial={{ opacity: 0, y: 30 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">
              No surprises. Pick your plan and Riley is live on your phone line within 24 hours.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center pt-6">
            <StarterCard plan={plans[0]} index={0} onSelect={() => setSelectedPlan(plans[0])} />
            <ProCard plan={plans[1]} index={1} onSelect={() => setSelectedPlan(plans[1])} />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={headingInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
            className="text-center text-sm text-zinc-400 mt-12"
          >
            Questions? Call or text us anytime. Cancel your subscription at any time, no questions asked.
          </motion.p>
        </div>
      </section>
    </>
  );
}
