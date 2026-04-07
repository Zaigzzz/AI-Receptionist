"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        <motion.div {...fadeUp(0)}>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <h1 className="font-display text-3xl font-extrabold text-zinc-900 mb-2 tracking-tight">
            Reset your password
          </h1>
          <p className="text-zinc-500 text-sm mb-8">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </motion.div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-zinc-900 mx-auto mb-4" />
            <h2 className="font-bold text-zinc-900 text-lg mb-2">Check your email</h2>
            <p className="text-zinc-500 text-sm">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
          </motion.div>
        ) : (
          <motion.form onSubmit={handleSubmit} className="space-y-4" {...fadeUp(0.1)}>
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200 ${
                    error
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : "border-zinc-200 bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8"
                  }`}
                />
              </div>
              {error && <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#09090b] hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
