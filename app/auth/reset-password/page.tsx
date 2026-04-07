"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
});

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold text-zinc-900 mb-2">Invalid Reset Link</h1>
          <p className="text-zinc-500 text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Link href="/auth/forgot-password" className="text-sm font-bold text-zinc-900 hover:underline">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-center"
          >
            <CheckCircle2 className="w-10 h-10 text-zinc-900 mx-auto mb-4" />
            <h2 className="font-bold text-zinc-900 text-lg mb-2">Password reset</h2>
            <p className="text-zinc-500 text-sm mb-6">Your password has been updated successfully.</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-[#09090b] hover:bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div {...fadeUp(0)}>
              <h1 className="font-display text-3xl font-extrabold text-zinc-900 mb-2 tracking-tight">
                Set new password
              </h1>
              <p className="text-zinc-500 text-sm mb-8">Enter your new password below.</p>
            </motion.div>

            <motion.form onSubmit={handleSubmit} className="space-y-4" {...fadeUp(0.1)}>
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Min. 8 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8 transition-all duration-200"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#09090b] hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reset Password"}
              </button>
            </motion.form>
          </>
        )}
      </div>
    </div>
  );
}
