"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE },
});

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#52525b", "#09090b"];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? colors[score] : "#e4e4e7" }}
          />
        ))}
      </div>
      <p className="text-xs font-semibold" style={{ color: colors[score] }}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const [form, setForm] = useState({ name: "", business: "", email: "", password: "", confirm: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState<Partial<typeof form & { server?: string }>>({});
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined, server: undefined }));
    };
  }

  function validate() {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Full name is required.";
    if (!form.business.trim()) e.business = "Business name is required.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, business: form.business, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ server: data.error } as { server: string });
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setLoading(false);
        return;
      }
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.error) {
        setErrors({ server: "Account created but sign-in failed. Please log in manually." } as { server: string });
        router.push("/auth/login");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setErrors({ server: "Something went wrong. Please try again." } as { server: string });
      setLoading(false);
    }
  }

  const inputClass = (id: keyof typeof form) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200 ${
      errors[id]
        ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
        : "border-zinc-200 bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8"
    }`;

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[#09090b] w-[46%] shrink-0 p-12 xl:p-16"
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full border border-white/5 pointer-events-none" />

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
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#09090b] flex items-center justify-center">
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                  <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="white" />
                  <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="white" />
                  <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="white" />
                  <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="white" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-zinc-900 tracking-tight">
                ProAnswer
              </span>
            </Link>
          </div>

          <motion.div {...fadeUp(0)}>
            <h1 className="font-display text-3xl font-extrabold text-zinc-900 mb-1 tracking-tight">Create your account</h1>
            <p className="text-zinc-500 text-sm mb-8">Get your AI receptionist live in under 24 hours.</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [0, -8, 8, -6, 6, -2, 2, 0] } : {}}
            transition={{ duration: 0.45 }}
            className="space-y-4"
          >
            {/* Name */}
            <motion.div {...fadeUp(0.14)}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" value={form.name} onChange={set("name")} placeholder="Jane Smith" className={inputClass("name")} />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
            </motion.div>

            {/* Business */}
            <motion.div {...fadeUp(0.18)}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Business Name</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="text" value={form.business} onChange={set("business")} placeholder="Smith Plumbing Co." className={inputClass("business")} />
              </div>
              {errors.business && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.business}</p>}
            </motion.div>

            {/* Email */}
            <motion.div {...fadeUp(0.22)}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputClass("email")} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.email}</p>}
            </motion.div>

            {/* Password with strength */}
            <motion.div {...fadeUp(0.26)}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={show.password ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 8 characters"
                  className={inputClass("password") + " pr-11"}
                />
                <button type="button" onClick={() => setShow((s) => ({ ...s, password: !s.password }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {show.password ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.password}</p>}
              <PasswordStrength password={form.password} />
            </motion.div>

            {/* Confirm password */}
            <motion.div {...fadeUp(0.3)}>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type={show.confirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={set("confirm")}
                  placeholder="Re-enter your password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all duration-200 ${
                    errors.confirm
                      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-100"
                      : form.confirm && form.confirm === form.password
                      ? "border-zinc-900 bg-zinc-50 focus:ring-2 focus:ring-zinc-900/8"
                      : "border-zinc-200 bg-white focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8"
                  }`}
                />
                <button type="button" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.confirm}</p>}
            </motion.div>

            {(errors as { server?: string }).server && (
              <p className="text-red-500 text-sm font-medium text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-4">
                {(errors as { server?: string }).server}
              </p>
            )}

            <motion.div {...fadeUp(0.34)} className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#09090b] hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-sm transition-all duration-200 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div {...fadeUp(0.38)} className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-zinc-200" />
              <span className="text-xs text-zinc-400 font-medium">or</span>
              <div className="flex-1 h-px bg-zinc-200" />
            </motion.div>

            {/* Google sign-up */}
            <motion.div {...fadeUp(0.42)}>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-3 border border-zinc-200 bg-white text-zinc-700 font-semibold py-3.5 rounded-xl text-sm transition-all duration-300 hover:bg-zinc-100 hover:border-zinc-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </motion.div>

            <motion.p {...fadeUp(0.46)} className="text-center text-xs text-zinc-400 pt-1">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-zinc-700 hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-zinc-700 hover:underline">Privacy Policy</Link>.
            </motion.p>
          </motion.form>

          <motion.p {...fadeUp(0.42)} className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-zinc-900 font-bold hover:underline transition-colors">
              Log in
            </Link>
          </motion.p>
        </div>
      </div>
    </div>
  );
}
