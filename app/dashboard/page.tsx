"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, PhoneIncoming, PhoneMissed, TrendingUp,
  LogOut, LayoutDashboard, PhoneCall, Settings, Menu, X,
  Building2, User, MapPin, Clock, Wrench, Sparkles, Save,
  CheckCircle2, Circle, ChevronDown, Bell, Zap, RefreshCw,
  Mic, AlertCircle, ChevronRight, Timer, MessageSquare,
  Smile, Wand2, Info, Users, CalendarCheck, PhoneForwarded,
} from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import type { VapiCall, CallStats } from "@/app/api/vapi/calls/route";

const BUSINESS_TYPES = [
  "Plumbing","HVAC","Electrical","Roofing",
  "Landscaping","Cleaning","Pest Control","Other",
];

const PERSONALITIES = [
  { value: "friendly",     label: "Friendly",     desc: "Warm, approachable, conversational" },
  { value: "professional", label: "Professional",  desc: "Formal, precise, business-like" },
  { value: "upbeat",       label: "Upbeat",        desc: "Energetic, enthusiastic, positive" },
];

const GREETING_SUGGESTIONS = (biz: string, type: string) => [
  `Thanks for calling ${biz || "us"}! This is Riley. How can I help you today?`,
  `${biz || "Hello"}! You've reached our ${type || "service"} team. This is Riley speaking — what can I do for you?`,
  `Thanks for calling ${biz || "us"}! You've reached our AI receptionist Riley. Are you calling to schedule a service or do you have a question?`,
  `Hi there! Thanks for calling ${biz || "us"}. This is Riley — I'm here to help. What can I assist you with today?`,
];

const INSTRUCTION_CHIPS = [
  "Always ask for the caller's name and phone number",
  "Mention we offer free estimates for new customers",
  "Ask how they heard about us",
  "Let them know we offer emergency same-day service",
  "Always mention our satisfaction guarantee",
  "Offer to text a confirmation after booking",
  "Ask if they have a preferred appointment time",
  "Remind callers about our seasonal discount",
];

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Leads",     icon: Users },
  { label: "Call Logs",  icon: PhoneCall },
  { label: "Settings",  icon: Settings },
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] },
});

function fmtDuration(secs?: number) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function callLabel(call: VapiCall) {
  if (!call.durationSeconds || call.durationSeconds === 0) return "Missed";
  if (call.type === "webCall") return "Web Demo";
  return "Answered";
}

function callColor(call: VapiCall) {
  const label = callLabel(call);
  if (label === "Missed")   return { dot: "bg-red-400",    text: "text-red-500",    bg: "bg-red-50"    };
  if (label === "Web Demo") return { dot: "bg-zinc-400",   text: "text-zinc-500",   bg: "bg-zinc-100"  };
  return                           { dot: "bg-zinc-900",   text: "text-zinc-900",   bg: "bg-zinc-100"  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName  = session?.user?.name ?? "there";
  const userEmail = session?.user?.email ?? "";
  const username  = (session?.user as { username?: string })?.username ?? userName;
  const firstName = userName.split(" ")[0];

  // Show success banner if redirected from Stripe checkout
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("checkout") === "success") {
        setCheckoutSuccess(true);
        // Clean URL without reload
        window.history.replaceState({}, "", "/dashboard");
        setTimeout(() => setCheckoutSuccess(false), 10000);
      }
    }
  }, []);

  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [activeNav,      setActiveNav]      = useState("Dashboard");
  const [receptionistOn, setReceptionistOn] = useState(false);
  const [toggleLoading,  setToggleLoading]  = useState(false);

  async function handleToggle(val: boolean) {
    setToggleLoading(true);
    try {
      const res = await fetch("/api/vapi/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: val }),
      });
      if (res.ok) setReceptionistOn(val);
    } finally {
      setToggleLoading(false);
    }
  }

  const [saved,          setSaved]          = useState(false);
  const [saveError,      setSaveError]      = useState("");
  const [expandedCall,   setExpandedCall]   = useState<string | null>(null);

  const [stats,    setStats]    = useState<CallStats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  const fetchCalls = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/vapi/calls");
      if (!res.ok) throw new Error();
      const data: CallStats = await res.json();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  const [profile, setProfile] = useState({
    businessName: "", ownerName: userName, businessType: "",
    phone: "", city: "", state: "", hours: "", services: "",
    firstMessage: "", personality: "friendly",
    instructions: "", afterHoursMessage: "", holidayMessage: "",
  });
  const [profileLoaded,    setProfileLoaded]    = useState(false);
  const [hasAssistant,     setHasAssistant]     = useState(false);
  const [hasPhoneNumber,   setHasPhoneNumber]   = useState(false);
  const [vapiPhoneNumber,  setVapiPhoneNumber]  = useState<string | null>(null);
  const [customerStatus,   setCustomerStatus]   = useState("pending");
  const [forwardingSetup,  setForwardingSetup]  = useState(false);

  useEffect(() => {
    if (profileLoaded) return;
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile((p) => ({ ...p, ...data.profile }));
        } else if (data.name) {
          setProfile((p) => ({ ...p, ownerName: data.name }));
        }
        setHasAssistant(!!data.vapiAssistantId);
        setHasPhoneNumber(!!data.vapiPhoneNumberId);
        setVapiPhoneNumber(data.vapiPhoneNumber ?? null);
        setCustomerStatus(data.status ?? "pending");
        setForwardingSetup(data.forwardingSetup ?? false);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [profileLoaded]);

  useEffect(() => {
    if (!profileLoaded) setProfile((p) => ({ ...p, ownerName: userName }));
  }, [userName, profileLoaded]);

  const profileComplete =
    !!profile.businessName && !!profile.businessType &&
    !!profile.phone && !!profile.city;

  const checklist = [
    { label: "Account Created",           done: true },
    { label: "Business Profile Complete", done: profileComplete },
    { label: "Make a Test Call",          done: hasAssistant && (stats?.answered ?? 0) > 0 },
  ];

  function setField(field: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setProfile((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError("");

    // Require business name before pushing to Vapi
    if (hasAssistant && !profile.businessName.trim()) {
      setSaveError("Business name is required before Riley can go live.");
      return;
    }

    try {
      // Save profile locally first
      const localRes = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!localRes.ok) throw new Error("Failed to save profile");

      // Push to Vapi only if an assistant is configured for this account
      if (hasAssistant) {
        const vapiRes = await fetch("/api/vapi/update-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });
        if (!vapiRes.ok) throw new Error("Profile saved, but Riley update failed — try again");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  const answerRate = stats && (stats.answered + stats.missed) > 0
    ? Math.round((stats.answered / (stats.answered + stats.missed)) * 100) + "%"
    : "—";

  const totalMinutes = stats ? Math.round((stats.totalSeconds ?? 0) / 60) : 0;

  // ── Input style ──────────────────────────────────────────────────────────
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/8 transition-all bg-zinc-50";

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="#09090b" />
              <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="#09090b" />
              <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="#09090b" />
              <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="#09090b" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            ProAnswer
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ label, icon: Icon }) => (
          <button key={label}
            onClick={() => { setActiveNav(label); if (mobile) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeNav === label
                ? "bg-white text-zinc-900"
                : "text-white/50 hover:text-white hover:bg-white/8"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-6 mt-4 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{firstName[0]?.toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{username}</p>
            <p className="text-white/30 text-[10px] truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );

  // ── Dashboard Tab ─────────────────────────────────────────────────────
  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Checkout success banner */}
      {checkoutSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 text-white rounded-2xl px-5 py-4 flex items-start gap-3 shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Payment confirmed — welcome to ProAnswer!</p>
            <p className="text-zinc-400 text-xs mt-0.5">
              Our team is building your AI receptionist now. You&apos;ll receive an email within 24 hours with your dedicated phone number and confirmation that Riley is live.
            </p>
          </div>
        </motion.div>
      )}

      {/* Setup pending banner (paid but no assistant yet) */}
      {!hasAssistant && !checkoutSuccess && (
        <motion.div
          {...fade(0)}
          className="bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-zinc-700">Your AI is being set up</p>
            <p className="text-zinc-500 text-xs mt-0.5">
              Our team is configuring your dedicated assistant. Fill in your business profile below so Riley is trained correctly from day one — we read it before going live.
            </p>
          </div>
        </motion.div>
      )}

      {/* Welcome + toggle */}
      <motion.div {...fade(0)} className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-zinc-900 tracking-tight">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {firstName} 👋
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            {!hasAssistant
              ? "Your AI receptionist is being prepared by our team."
              : profileComplete
              ? "Your AI receptionist is configured and ready."
              : "Complete your business profile below to train Riley."}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2.5 bg-white border border-zinc-200 rounded-2xl px-4 py-2.5 shadow-sm">
          <span className="text-xs font-bold text-zinc-600 hidden sm:block">Receptionist</span>
          <button onClick={() => !toggleLoading && handleToggle(!receptionistOn)}
            disabled={toggleLoading}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${receptionistOn ? "bg-zinc-900" : "bg-zinc-200"} ${toggleLoading ? "opacity-60 cursor-wait" : ""}`}
          >
            {toggleLoading
              ? <div className="absolute inset-0 flex items-center justify-center"><RefreshCw className="w-3 h-3 text-white animate-spin" /></div>
              : <motion.div animate={{ x: receptionistOn ? 20 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
            }
          </button>
          <span className={`text-xs font-bold ${receptionistOn ? "text-zinc-900" : "text-zinc-400"}`}>
            {receptionistOn ? "ON" : "OFF"}
          </span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Calls Answered", value: loading ? "…" : String(stats?.answered ?? 0), icon: PhoneIncoming, iconCls: "text-zinc-700",  bgCls: "bg-zinc-100"  },
          { label: "Calls Missed",   value: loading ? "…" : String(stats?.missed   ?? 0), icon: PhoneMissed,   iconCls: "text-red-500",   bgCls: "bg-red-50"    },
          { label: "Total Minutes",  value: loading ? "…" : String(totalMinutes),          icon: Timer,         iconCls: "text-zinc-700",  bgCls: "bg-zinc-100"  },
          { label: "Answer Rate",    value: loading ? "…" : answerRate,                    icon: TrendingUp,    iconCls: "text-zinc-700",  bgCls: "bg-zinc-100"  },
        ].map((s, i) => (
          <motion.div key={s.label} {...fade(0.05 + i * 0.07)}
            className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm"
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${s.bgCls}`}>
              <s.icon className={`w-4 h-4 ${s.iconCls}`} />
            </div>
            <p className="font-display text-2xl font-extrabold text-zinc-900">{s.value}</p>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main two-col */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Assistant Config */}
        <motion.div {...fade(0.2)} className="lg:col-span-2 bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="bg-[#09090b] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Riley — Assistant Config</h3>
                <p className="text-white/40 text-xs">Everything Riley knows and says about your business</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white/80 text-xs font-bold">Riley</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="divide-y divide-zinc-100">

            {/* ── Section 1: Business Info ── */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Business Info</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Business Name</label>
                  <input value={profile.businessName} onChange={setField("businessName")} placeholder="Smith Plumbing Co." className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Owner&apos;s Name</label>
                  <input value={profile.ownerName} onChange={setField("ownerName")} placeholder="Jane Smith" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Business Type</label>
                  <div className="relative">
                    <select value={profile.businessType} onChange={setField("businessType")} className={inputCls + " appearance-none"}>
                      <option value="">Select a type...</option>
                      {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Business Phone</label>
                  <input value={profile.phone} onChange={setField("phone")} placeholder="(555) 123-4567" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 mb-1.5">City / Town</label>
                  <input value={profile.city} onChange={setField("city")} placeholder="Brooklyn" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5">State</label>
                    <input value={profile.state} onChange={setField("state")} placeholder="NY" maxLength={2} className={inputCls + " uppercase"} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Hours</label>
                    <input value={profile.hours} onChange={setField("hours")} placeholder="M–F 8–6pm" className={inputCls} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Services Offered</label>
                <textarea value={profile.services} onChange={setField("services")} rows={2}
                  placeholder="Drain cleaning, pipe repair, water heater installation, emergency plumbing..."
                  className={inputCls + " resize-none"} />
              </div>
            </div>

            {/* ── Section 2: First Message ── */}
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">First Message</span>
                </div>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Info className="w-3 h-3" /> What Riley says when she picks up
                </span>
              </div>
              <textarea value={profile.firstMessage} onChange={setField("firstMessage")} rows={2}
                placeholder={`Thanks for calling ${profile.businessName || "[Business Name]"}! This is Riley. How can I help you today?`}
                className={inputCls + " resize-none"} />
              <div>
                <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Wand2 className="w-3 h-3" /> Suggestions — click to use
                </p>
                <div className="flex flex-col gap-2">
                  {GREETING_SUGGESTIONS(profile.businessName, profile.businessType).map((s, i) => (
                    <button key={i} type="button"
                      onClick={() => setProfile((p) => ({ ...p, firstMessage: s }))}
                      className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                        profile.firstMessage === s
                          ? "border-zinc-900 bg-zinc-50 text-zinc-900 font-semibold"
                          : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-400 hover:text-zinc-800"
                      }`}>
                      <span className="text-zinc-400 mr-1.5">→</span>{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 3: Personality ── */}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Smile className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Personality / Tone</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PERSONALITIES.map((p) => (
                  <button key={p.value} type="button"
                    onClick={() => setProfile((prev) => ({ ...prev, personality: p.value }))}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                      profile.personality === p.value
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}>
                    <p className={`text-sm font-bold mb-0.5 ${profile.personality === p.value ? "text-zinc-900" : "text-zinc-600"}`}>{p.label}</p>
                    <p className="text-[11px] text-zinc-400 leading-tight">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Section 4: Instructions ── */}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Special Instructions</span>
              </div>
              <textarea value={profile.instructions} onChange={setField("instructions")} rows={3}
                placeholder="Add any custom instructions here..."
                className={inputCls + " resize-none"} />
              <div>
                <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Wand2 className="w-3 h-3" /> Quick add — click to append
                </p>
                <div className="flex flex-wrap gap-2">
                  {INSTRUCTION_CHIPS.map((chip) => (
                    <button key={chip} type="button"
                      onClick={() => setProfile((p) => ({
                        ...p,
                        instructions: p.instructions ? `${p.instructions}\n${chip}` : chip,
                      }))}
                      className="text-xs px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-all">
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Section 5: After Hours ── */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">After Hours &amp; Holidays</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">After Hours Message</label>
                <textarea value={profile.afterHoursMessage} onChange={setField("afterHoursMessage")} rows={2}
                  placeholder={`Thanks for calling ${profile.businessName || "us"}! We're currently closed. Our hours are ${profile.hours || "Mon–Fri 8am–6pm"}. Please leave your name and number and we'll call you back first thing in the morning.`}
                  className={inputCls + " resize-none"} />
                <p className="text-[11px] text-zinc-400 mt-1">Riley says this when someone calls outside your business hours.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1.5">Holiday / Closed Day Message</label>
                <textarea value={profile.holidayMessage} onChange={setField("holidayMessage")} rows={2}
                  placeholder={`Thanks for calling ${profile.businessName || "us"}! We're closed today for the holiday. We'll be back tomorrow. For emergencies, please call our emergency line.`}
                  className={inputCls + " resize-none"} />
                <p className="text-[11px] text-zinc-400 mt-1">Riley says this on holidays or days you mark as closed.</p>
              </div>
            </div>

            {/* ── Save ── */}
            <div className="p-6 flex flex-col gap-3">
              {saveError && (
                <p className="text-red-500 text-xs font-medium bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {saveError}
                </p>
              )}
              <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">Changes are pushed to Riley instantly on save.</p>
              <button type="submit"
                className="flex items-center gap-2 bg-[#09090b] hover:bg-zinc-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm shadow-sm">
                <AnimatePresence mode="wait">
                  {saved
                    ? <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-white" /> Saved &amp; Applied!
                      </motion.span>
                    : <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save &amp; Apply to Riley
                      </motion.span>
                  }
                </AnimatePresence>
              </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Right sidebar cards */}
        <div className="space-y-4">
          {/* Setup Progress */}
          <motion.div {...fade(0.25)} className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-zinc-900 text-sm">Setup Progress</h3>
            </div>
            <div className="space-y-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.done
                    ? <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0" />
                    : <Circle className="w-5 h-5 text-zinc-300 shrink-0" />}
                  <span className={`text-sm ${item.done ? "text-zinc-900 font-semibold" : "text-zinc-400"}`}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                <span>Progress</span>
                <span>{checklist.filter(c => c.done).length}/{checklist.length}</span>
              </div>
              <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-zinc-900 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Receptionist Status */}
          <motion.div {...fade(0.3)} className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-zinc-400" />
              <h3 className="font-bold text-zinc-900 text-sm">Receptionist Status</h3>
            </div>
            <div className={`rounded-2xl p-4 border transition-all ${receptionistOn ? "bg-zinc-50 border-zinc-200" : "bg-zinc-50 border-zinc-100"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-zinc-900">
                  Riley is {receptionistOn ? "Active" : "Inactive"}
                </span>
                <button onClick={() => !toggleLoading && handleToggle(!receptionistOn)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${receptionistOn ? "bg-zinc-900" : "bg-zinc-200"}`}>
                  <motion.div animate={{ x: receptionistOn ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                {receptionistOn ? "Answering all incoming calls 24/7" : "Toggle on to start answering calls"}
              </p>
            </div>
          </motion.div>

          {/* Connect Phone / Forwarding Info */}
          {vapiPhoneNumber ? (
            <motion.div {...fade(0.35)} className="bg-[#09090b] rounded-3xl p-5 shadow-lg">
              <Phone className="w-5 h-5 text-zinc-400 mb-3" />
              <h3 className="text-white font-bold text-sm mb-1">
                {forwardingSetup ? "Forwarding Active" : "Forward Your Number"}
              </h3>
              {forwardingSetup ? (
                <p className="text-white/40 text-xs leading-relaxed mb-3">
                  Calls to your business line are being forwarded to Riley.
                </p>
              ) : (
                <>
                  <p className="text-white/40 text-xs leading-relaxed mb-3">
                    Dial the code below from your business phone to forward calls to Riley:
                  </p>
                  <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-3">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Dial from your business phone</p>
                    <p className="text-white font-mono font-bold text-lg tracking-wider">*72{vapiPhoneNumber}</p>
                  </div>
                  <p className="text-white/30 text-[10px] leading-relaxed">
                    To cancel forwarding later, dial <span className="font-mono font-bold">*73</span> from your business phone.
                  </p>
                </>
              )}
              <div className="mt-3 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${forwardingSetup ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span className={`text-xs font-medium ${forwardingSetup ? "text-emerald-400" : "text-amber-400"}`}>
                  {forwardingSetup ? "Connected" : "Awaiting setup"}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div {...fade(0.35)} className="bg-[#09090b] rounded-3xl p-5 shadow-lg">
              <Phone className="w-5 h-5 text-zinc-400 mb-3" />
              <h3 className="text-white font-bold text-sm mb-1">Connect Your Number</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-4">
                {customerStatus === "pending" || customerStatus === "setting_up"
                  ? "We're setting up your dedicated phone number. You'll see forwarding instructions here once it's ready."
                  : "Forward your business number to Riley and she starts answering immediately."}
              </p>
              <Link href="/onboarding"
                className="block text-center bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-xs px-4 py-2.5 rounded-xl transition-all">
                View Setup Guide →
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Call Logs Tab ──────────────────────────────────────────────────────
  const CallLogsTab = () => (
    <div className="space-y-5">
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-zinc-900 tracking-tight">Call Logs</h2>
          <p className="text-zinc-500 text-sm mt-0.5">All calls handled by Riley</p>
        </div>
        <button onClick={fetchCalls}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Summary strip */}
      <motion.div {...fade(0.05)} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Calls", value: loading ? "…" : String((stats?.answered ?? 0) + (stats?.missed ?? 0)), color: "text-zinc-900" },
          { label: "Answered",    value: loading ? "…" : String(stats?.answered ?? 0), color: "text-zinc-900" },
          { label: "Missed",      value: loading ? "…" : String(stats?.missed   ?? 0), color: "text-red-500"  },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm text-center">
            <p className={`font-display text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Call list */}
      <motion.div {...fade(0.1)} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
            <p className="text-sm text-zinc-500">Loading calls...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-sm text-zinc-700 font-semibold">Failed to load calls</p>
            <button onClick={fetchCalls} className="text-xs text-zinc-900 font-bold hover:underline">Try again</button>
          </div>
        ) : !stats?.calls?.length ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <PhoneCall className="w-8 h-8 text-zinc-200" />
            <p className="text-sm font-semibold text-zinc-700">No calls yet</p>
            <p className="text-xs text-zinc-400">Calls will appear here once Riley starts answering</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {stats.calls.map((call, i) => {
              const c = callColor(call);
              const isExpanded = expandedCall === call.id;
              return (
                <motion.div key={call.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <button onClick={() => setExpandedCall(isExpanded ? null : call.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 transition-colors text-left">
                    <div className={`w-9 h-9 rounded-full ${c.bg} flex items-center justify-center shrink-0`}>
                      {callLabel(call) === "Missed"
                        ? <PhoneMissed className="w-4 h-4 text-red-400" />
                        : <PhoneIncoming className="w-4 h-4 text-zinc-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                          {callLabel(call)}
                        </span>
                        {call.type === "webCall" && (
                          <span className="text-[10px] text-zinc-400 font-medium">Web Demo</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">{fmtDate(call.startedAt)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-zinc-900">{fmtDuration(call.durationSeconds)}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-zinc-300 transition-transform shrink-0 ${isExpanded ? "rotate-90" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pt-1 bg-zinc-50 border-t border-zinc-100">
                          {call.transcript ? (
                            <div>
                              <div className="flex items-center gap-1.5 mb-2">
                                <Mic className="w-3 h-3 text-zinc-400" />
                                <span className="text-xs font-bold text-zinc-600 uppercase tracking-wide">Transcript</span>
                              </div>
                              <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-wrap bg-white rounded-xl border border-zinc-200 p-3 max-h-40 overflow-y-auto">
                                {call.transcript}
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-zinc-400 italic">No transcript available</p>
                          )}
                          {call.recordingUrl && (
                            <div className="mt-3">
                              <p className="text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Recording</p>
                              <audio controls src={call.recordingUrl} className="w-full h-8" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── Leads Tab ─────────────────────────────────────────────────────────
  interface BookingData {
    id: string;
    callerName: string | null;
    callerPhone: string | null;
    callerAddress: string | null;
    serviceNeeded: string | null;
    preferredTime: string | null;
    notes: string | null;
    summary: string | null;
    source: string;
    createdAt: string;
  }

  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch("/api/user/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings ?? []);
      }
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const LeadsTab = () => (
    <div className="space-y-5">
      <motion.div {...fade(0)} className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-zinc-900 tracking-tight">Leads</h2>
          <p className="text-zinc-500 text-sm mt-0.5">All leads captured by Riley from your calls</p>
        </div>
        <button onClick={fetchBookings}
          className="flex items-center gap-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 px-4 py-2 rounded-xl transition-all shadow-sm">
          <RefreshCw className={`w-4 h-4 ${bookingsLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* Summary strip */}
      <motion.div {...fade(0.05)} className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Leads", value: bookings.length, icon: Users, iconCls: "text-zinc-700", bgCls: "bg-zinc-100" },
          { label: "From Calls", value: bookings.filter(b => b.source === "tool_call").length, icon: PhoneForwarded, iconCls: "text-zinc-700", bgCls: "bg-zinc-100" },
          { label: "From Transcripts", value: bookings.filter(b => b.source === "transcript").length, icon: MessageSquare, iconCls: "text-zinc-700", bgCls: "bg-zinc-100" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${s.bgCls}`}>
              <s.icon className={`w-4 h-4 ${s.iconCls}`} />
            </div>
            <p className="font-display text-xl font-extrabold text-zinc-900">{s.value}</p>
            <p className="text-[11px] text-zinc-500 font-medium">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Leads list */}
      <motion.div {...fade(0.1)} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        {bookingsLoading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 text-zinc-300 mx-auto mb-3 animate-spin" />
            <p className="text-zinc-400 text-sm">Loading leads...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center px-6">
            <Users className="w-10 h-10 text-zinc-200 mx-auto mb-4" />
            <h3 className="font-bold text-zinc-900 text-base mb-1">No leads yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
              When Riley captures caller information during calls, their details will appear here automatically.
            </p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_1fr_100px] gap-4 px-5 py-3 bg-zinc-50 border-b border-zinc-100 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
              <span>Caller</span><span>Phone</span><span>Service</span><span>Date</span>
            </div>
            {bookings.map((b, i) => (
              <div key={b.id} className={`border-b border-zinc-50 last:border-0 ${i % 2 === 1 ? "bg-zinc-50/50" : ""}`}>
                <div
                  className="grid grid-cols-[1fr_120px_1fr_100px] gap-4 px-5 py-3.5 items-center hover:bg-zinc-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 text-xs font-bold flex-shrink-0">
                      {(b.callerName ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-zinc-900 text-sm font-semibold truncate">{b.callerName || "Unknown"}</p>
                      {b.callerAddress && <p className="text-zinc-400 text-xs truncate">{b.callerAddress}</p>}
                    </div>
                  </div>
                  <span className="text-zinc-700 text-sm font-mono">{b.callerPhone || "—"}</span>
                  <span className="text-zinc-600 text-sm truncate">{b.serviceNeeded || "—"}</span>
                  <span className="text-zinc-400 text-xs">{new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>

                <AnimatePresence>
                  {expandedBooking === b.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-1 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { label: "Full Name", value: b.callerName },
                            { label: "Phone", value: b.callerPhone },
                            { label: "Address", value: b.callerAddress },
                            { label: "Service Needed", value: b.serviceNeeded },
                            { label: "Preferred Time", value: b.preferredTime },
                            { label: "Source", value: b.source === "tool_call" ? "Booked during call" : "Extracted from transcript" },
                          ].filter(f => f.value).map(({ label, value }) => (
                            <div key={label} className="bg-zinc-50 rounded-xl px-3 py-2.5 border border-zinc-100">
                              <p className="text-zinc-400 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                              <p className="text-zinc-900 text-sm font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                        {b.summary && (
                          <div className="bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-100">
                            <p className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Call Summary</p>
                            <p className="text-zinc-700 text-sm leading-relaxed">{b.summary}</p>
                          </div>
                        )}
                        {b.notes && (
                          <div className="bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-100">
                            <p className="text-zinc-400 text-[10px] uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-zinc-700 text-sm leading-relaxed">{b.notes}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );

  // ── Settings Tab ──────────────────────────────────────────────────────
  const SettingsTab = () => (
    <motion.div {...fade(0)} className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 max-w-lg">
      <h2 className="font-display text-xl font-extrabold text-zinc-900 mb-1">Settings</h2>
      <p className="text-zinc-500 text-sm mb-6">Account and preferences</p>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Name</label>
          <input defaultValue={userName} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Email</label>
          <input defaultValue={userEmail} disabled className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-100 text-sm text-zinc-400 bg-zinc-50" />
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-600 uppercase tracking-wide mb-1.5">Username</label>
          <input defaultValue={username} disabled className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-100 text-sm text-zinc-400 bg-zinc-50" />
        </div>
        <button className="flex items-center gap-2 bg-[#09090b] hover:bg-zinc-800 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm">
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-[#09090b] fixed inset-y-0 left-0 z-40">
        {SidebarContent({})}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-56 bg-[#09090b] z-50 lg:hidden">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              {SidebarContent({ mobile: true })}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-zinc-100 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-zinc-900">{activeNav}</h1>
              <p className="text-[10px] text-zinc-400 hidden sm:block">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-zinc-100 transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#09090b] flex items-center justify-center shadow">
              <span className="text-xs font-bold text-white">{firstName[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-5xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeNav === "Dashboard" && <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{DashboardTab()}</motion.div>}
            {activeNav === "Leads"      && <motion.div key="leads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{LeadsTab()}</motion.div>}
            {activeNav === "Call Logs"  && <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{CallLogsTab()}</motion.div>}
            {activeNav === "Settings"   && <motion.div key="sets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{SettingsTab()}</motion.div>}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
