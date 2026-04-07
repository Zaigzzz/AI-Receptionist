"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
});

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#09090b] flex items-center justify-center flex-shrink-0">
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="white" />
        <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="white" />
        <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="white" />
        <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="white" />
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; server?: string }>({});
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate() {
    const e: typeof errors = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (!password || password.length < 6) e.password = "Password must be at least 6 characters.";
    return e;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false, callbackUrl });
      if (!res?.ok) {
        setErrors({ server: "Invalid email or password. Please try again." });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setErrors({ server: "Invalid email or password. Please try again." });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[#09090b] w-[46%] shrink-0 p-12 xl:p-16"
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Rings */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="#09090b" />
                <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="#09090b" />
                <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="#09090b" />
                <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="#09090b" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              ProAnswer
            </span>
          </Link>
        </div>

        {/* Tagline */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">AI Receptionist Platform</p>
            <h2 className="font-display text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Every call answered.<br />
              <span className="text-zinc-400">Every opportunity</span><br />
              captured.
            </h2>
            <p className="text-zinc-500 text-base leading-relaxed max-w-sm">
              Join thousands of home service businesses running 24/7 — without hiring extra staff.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
            className="flex gap-8 mt-10"
          >
            {[{ value: "98%", label: "Answer rate" }, { value: "24/7", label: "Always on" }, { value: "< 2s", label: "Response time" }].map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
          className="relative z-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 fill-white text-white opacity-60" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-white/80 text-sm leading-relaxed mb-4 italic">
            &ldquo;We went from missing 40% of our calls to zero. ProAnswer paid for itself in the first week.&rdquo;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
              <span className="text-xs font-bold text-zinc-300">MT</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Marcus T.</p>
              <p className="text-zinc-500 text-xs">HVAC Business Owner</p>
            </div>
          </div>
        </motion.div>
      </motion.aside>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <LogoMark />
              <span className="font-display font-bold text-xl text-zinc-900 tracking-tight">
                ProAnswer
              </span>
            </Link>
          </div>

          <motion.div {...fadeUp(0)}>
            <h1 className="font-display text-3xl font-extrabold text-zinc-900 mb-1 tracking-tight">Welcome back</h1>
            <p className="text-zinc-500 text-sm mb-8">Sign in to your ProAnswer account.</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [0, -8, 8, -6, 6, -2, 2, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="space-y-4"
          >
            {/* Email */}
            <motion.div {...fadeUp(0.16)}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200 ${
                    errors.email
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : "border-zinc-200 bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8"
                  }`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </motion.div>

            {/* Password */}
            <motion.div {...fadeUp(0.2)}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-zinc-500 font-semibold hover:text-zinc-900 transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200 ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : "border-zinc-200 bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8"
                  }`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
            </motion.div>

            {errors.server && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                {errors.server}
              </p>
            )}

            <motion.div {...fadeUp(0.24)} className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#09090b] hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.div>
          </motion.form>

          <motion.p {...fadeUp(0.28)} className="text-center text-sm text-zinc-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-zinc-900 font-bold hover:underline transition-colors">
              Sign up free
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
