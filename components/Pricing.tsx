"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Check, X, Lock, ArrowRight,
  Loader2, Shield, RefreshCw
} from "lucide-react";

const PLAN = {
  id: "starter",
  name: "ProAnswer",
  monthly: "$149",
  features: [
    "Unlimited calls",
    "Custom AI receptionist script",
    "Dedicated business phone number",
    "Email & SMS call summaries",
    "Real-time dashboard & call logs",
    "Appointment booking",
    "Setup within 24 hours",
    "Cancel anytime",
  ],
};

function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
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
        body: JSON.stringify({ plan: PLAN.id }),
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
              <h3 className="font-display text-xl font-extrabold text-zinc-900">ProAnswer</h3>
            </div>
            <button onClick={onClose} suppressHydrationWarning
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors text-zinc-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-4 mb-6">
            <p className="text-zinc-900 font-bold text-sm">$149<span className="font-normal text-zinc-500">/month · unlimited calls</span></p>
            <p className="text-zinc-400 text-xs mt-2">No setup fee · No contracts · Cancel anytime</p>
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

export default function Pricing() {
  const [showModal, setShowModal] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <>
      <AnimatePresence>
        {showModal && <CheckoutModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>

      <section id="pricing" className="py-28 bg-white border-b border-zinc-100 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #09090b 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-4">
              One Plan. Everything Included.
            </h2>
            <p className="text-lg text-zinc-500 max-w-xl mx-auto">
              No tiers, no hidden fees. Riley is live on your phone line within 24 hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="relative"
          >
            <div className="relative bg-[#09090b] rounded-3xl p-10 shadow-2xl shadow-black/20">
              <div className="absolute inset-0 rounded-3xl opacity-[0.03]"
                style={{
                  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
                  <div>
                    <span className="inline-block bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 border border-white/20">
                      All-Inclusive
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-6xl font-extrabold text-white tracking-tight">$149</span>
                      <span className="text-zinc-400 font-medium text-lg">/month</span>
                    </div>
                    <p className="text-zinc-500 text-sm mt-2">No setup fee. No contracts. Cancel anytime.</p>
                  </div>

                  <button
                    onClick={() => setShowModal(true)}
                    suppressHydrationWarning
                    className="sm:w-auto w-full py-4 px-8 rounded-2xl font-bold text-base bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {PLAN.features.map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, x: -10 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center gap-3 text-sm text-zinc-300"
                    >
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="font-semibold">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
            className="text-center text-sm text-zinc-400 mt-10"
          >
            Questions? Call or text us anytime. Cancel your subscription at any time, no questions asked.
          </motion.p>
        </div>
      </section>
    </>
  );
}
