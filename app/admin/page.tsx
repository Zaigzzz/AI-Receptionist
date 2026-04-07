"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Shield, LayoutDashboard, Users, Activity,
  LogOut, Search, X, Briefcase, TrendingUp, UserPlus,
  Menu, Eye, Phone, PhoneMissed, PhoneCall, DollarSign,
  Clock, ChevronDown, ChevronUp, RefreshCw, BarChart2,
  Mic, ArrowUpRight, ArrowDownRight, Calendar, Star,
} from "lucide-react";
import type { AdminStats, AdminCall } from "@/app/api/admin/stats/route";

type Tab = "overview" | "growth" | "revenue" | "users" | "calls" | "activity";

const PLAN_PRICE = 300; // $ per user per month

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDuration(s?: number) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function fmtShortDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function callStatus(c: AdminCall) {
  if (!c.durationSeconds || c.durationSeconds === 0) return "missed";
  if (c.type === "webCall") return "demo";
  return "answered";
}

const statusStyle = {
  missed:   { dot: "bg-red-400",    badge: "bg-red-950 text-red-400 border-red-900",    label: "Missed"   },
  demo:     { dot: "bg-zinc-500",   badge: "bg-zinc-800 text-zinc-400 border-zinc-700", label: "Demo"     },
  answered: { dot: "bg-emerald-400",badge: "bg-emerald-950 text-emerald-400 border-emerald-900", label: "Answered" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// Group users by month of createdAt
function signupsByMonth(users: AdminStats["users"]) {
  const map: Record<string, number> = {};
  users.forEach((u) => {
    if (!u.createdAt) return;
    const d = new Date(u.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map[key] = (map[key] ?? 0) + 1;
  });
  // Fill last 6 months
  const result: { label: string; value: number; key: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short" });
    result.push({ key, label, value: map[key] ?? 0 });
  }
  return result;
}

function callsByDay(calls: AdminCall[]) {
  const map: Record<string, number> = {};
  calls.forEach((c) => {
    if (!c.startedAt) return;
    const d = new Date(c.startedAt);
    const key = d.toISOString().split("T")[0];
    map[key] = (map[key] ?? 0) + 1;
  });
  const result: { label: string; value: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    result.push({ label, value: map[key] ?? 0 });
  }
  return result;
}

// ─── SVG Line Chart ──────────────────────────────────────────────────────────

function LineChart({ data, color = "#fff" }: { data: { label: string; value: number }[]; color?: string }) {
  const W = 600, H = 100, PX = 30, PY = 12;
  const max = Math.max(...data.map((d) => d.value), 1);
  const pts = data.map((d, i) => ({
    x: PX + (i / Math.max(data.length - 1, 1)) * (W - PX * 2),
    y: PY + (1 - d.value / max) * (H - PY * 2),
    ...d,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = [
    `${pts[0].x},${H - PY}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${H - PY}`,
  ].join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <defs>
          <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill={`url(#grad-${color.replace("#", "")})`} />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
      </svg>
      {/* X labels */}
      <div className="flex justify-between mt-1 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-zinc-600 text-[10px]">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, trend, delay = 0, accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: { dir: "up" | "down"; text: string };
  delay?: number;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ?? "bg-zinc-800"}`}>
          <Icon className="w-4 h-4 text-zinc-400" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.dir === "up" ? "text-emerald-400" : "text-red-400"}`}>
            {trend.dir === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.text}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white leading-none mb-1">{value}</div>
      <div className="text-zinc-500 text-xs">{label}</div>
      {sub && <div className="text-zinc-600 text-xs mt-0.5">{sub}</div>}
    </motion.div>
  );
}

// ─── Lock Screen ─────────────────────────────────────────────────────────────

function LockScreen({ onUnlock }: { onUnlock: (data: AdminStats, secret: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { "x-admin-secret": password },
      });
      if (res.status === 401) { setError("Incorrect password."); return; }
      const data: AdminStats = await res.json();
      onUnlock(data, password);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-sm">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center mb-6">
            <Lock className="w-5 h-5 text-zinc-400" />
          </div>
          <h1 className="text-white font-bold text-xl mb-1">Admin Access</h1>
          <p className="text-zinc-500 text-sm mb-7">Enter your admin password to continue.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password" suppressHydrationWarning
              className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 transition-colors" />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button type="submit" disabled={loading || !password} suppressHydrationWarning
              className="w-full bg-white hover:bg-zinc-100 disabled:opacity-40 text-zinc-900 font-semibold text-sm py-3 rounded-xl transition-colors">
              {loading ? "Verifying…" : "Enter"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: AdminStats }) {
  const { users, calls, answered, missed, totalSeconds } = data;
  const mrr = users.length * PLAN_PRICE;
  const answerRate = (answered + missed) > 0 ? Math.round((answered / (answered + missed)) * 100) : 0;
  const avgDuration = answered > 0 ? Math.round(totalSeconds / answered) : 0;
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentCalls = [...calls].sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime()).slice(0, 5);

  return (
    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}>
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">{getGreeting()}, Nick</h1>
        <p className="text-zinc-500 text-sm mt-1">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Monthly Recurring Revenue" value={`$${mrr.toLocaleString()}`} icon={DollarSign} delay={0.05} trend={{ dir: "up", text: "This month" }} />
        <StatCard label="Annual Run Rate" value={`$${(mrr * 12).toLocaleString()}`} icon={TrendingUp} delay={0.1} />
        <StatCard label="Total Customers" value={users.length} icon={Users} delay={0.15} sub={`${users.length} active`} />
        <StatCard label="Total Calls Handled" value={calls.length} icon={Phone} delay={0.2} trend={{ dir: "up", text: `${answered} answered` }} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Answer Rate" value={`${answerRate}%`} icon={PhoneCall} delay={0.22} trend={answerRate >= 70 ? { dir: "up", text: "Good" } : { dir: "down", text: "Needs work" }} />
        <StatCard label="Avg Call Duration" value={fmtDuration(avgDuration)} icon={Clock} delay={0.25} />
        <StatCard label="Missed Calls" value={missed} icon={PhoneMissed} delay={0.28} />
        <StatCard label="Revenue / Customer" value={`$${PLAN_PRICE}`} icon={Star} delay={0.31} sub="per month" />
      </div>

      {/* Two columns: recent signups + recent calls */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent signups */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Recent Signups</h3>
          {recentUsers.length === 0 ? (
            <p className="text-zinc-600 text-sm">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{u.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{u.business}</p>
                  </div>
                  <p className="text-zinc-600 text-xs flex-shrink-0">{fmtShortDate(u.createdAt)}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent calls */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-4">Recent Calls</h3>
          {recentCalls.length === 0 ? (
            <p className="text-zinc-600 text-sm">No calls yet.</p>
          ) : (
            <div className="space-y-3">
              {recentCalls.map((c) => {
                const st = callStatus(c);
                const style = statusStyle[st];
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{style.label}</p>
                      <p className="text-zinc-500 text-xs">{fmtDuration(c.durationSeconds)}</p>
                    </div>
                    <p className="text-zinc-600 text-xs flex-shrink-0">{fmtShortDate(c.startedAt)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Growth Tab ───────────────────────────────────────────────────────────────

function GrowthTab({ data }: { data: AdminStats }) {
  const { users, calls } = data;
  const signups = signupsByMonth(users);
  const callDays = callsByDay(calls);
  const totalSignups = signups.reduce((s, d) => s + d.value, 0);
  const lastMonth = signups[signups.length - 2]?.value ?? 0;
  const thisMonth = signups[signups.length - 1]?.value ?? 0;
  const momGrowth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  return (
    <motion.div key="growth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Growth</h1>
        <p className="text-zinc-500 text-sm mt-1">Signups, call volume, and momentum over time.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mb-6">
        <StatCard label="Total Signups (all time)" value={totalSignups} icon={UserPlus} delay={0.05} />
        <StatCard label="This Month" value={thisMonth} icon={Calendar} delay={0.1}
          trend={momGrowth !== null ? { dir: momGrowth >= 0 ? "up" : "down", text: `${momGrowth >= 0 ? "+" : ""}${momGrowth}% vs last month` } : undefined} />
        <StatCard label="Total Calls (14 days)" value={callDays.reduce((s, d) => s + d.value, 0)} icon={Phone} delay={0.15} />
      </div>

      {/* Signup chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-sm">New Customers</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Monthly signups — last 6 months</p>
          </div>
          <div className="text-zinc-400 text-xs">{totalSignups} total</div>
        </div>
        <LineChart data={signups} />
      </motion.div>

      {/* Call volume chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-white font-semibold text-sm">Call Volume</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Daily calls handled — last 14 days</p>
          </div>
        </div>
        <LineChart data={callDays} color="#34d399" />
      </motion.div>
    </motion.div>
  );
}

// ─── Revenue Tab ──────────────────────────────────────────────────────────────

function RevenueTab({ data }: { data: AdminStats }) {
  const { users } = data;
  const mrr = users.length * PLAN_PRICE;
  const arr = mrr * 12;
  const ltv = PLAN_PRICE * 12; // assuming 12-month avg lifetime (placeholder)

  // Revenue by business type
  const byType: Record<string, number> = {};
  users.forEach((u) => {
    const key = u.business || "Unknown";
    byType[key] = (byType[key] ?? 0) + PLAN_PRICE;
  });
  const typeEntries = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const maxRevenue = typeEntries[0]?.[1] ?? 1;

  // MRR runway (next 6 months, flat)
  const mrrChart = Array.from({ length: 6 }, (_, i) => ({
    label: new Date(new Date().setMonth(new Date().getMonth() + i))
      .toLocaleDateString("en-US", { month: "short" }),
    value: mrr,
  }));

  return (
    <motion.div key="revenue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Revenue</h1>
        <p className="text-zinc-500 text-sm mt-1">MRR, ARR, and revenue breakdown.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} delay={0.05} trend={{ dir: "up", text: "Current" }} />
        <StatCard label="ARR" value={`$${arr.toLocaleString()}`} icon={TrendingUp} delay={0.1} />
        <StatCard label="Avg Revenue / User" value={`$${PLAN_PRICE}`} icon={BarChart2} delay={0.15} sub="per month" />
        <StatCard label="Est. LTV" value={`$${ltv.toLocaleString()}`} icon={Star} delay={0.2} sub="12-month avg" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* MRR projection */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-1">MRR Projection</h3>
          <p className="text-zinc-500 text-xs mb-6">At current customer base (flat)</p>
          <LineChart data={mrrChart} color="#facc15" />
        </motion.div>

        {/* Revenue by type */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold text-sm mb-6">Revenue by Trade</h3>
          {typeEntries.length === 0 ? (
            <p className="text-zinc-600 text-sm">No data.</p>
          ) : (
            <div className="space-y-4">
              {typeEntries.map(([type, rev], i) => (
                <div key={type} className="flex items-center gap-4">
                  <div className="w-24 text-zinc-400 text-xs truncate flex-shrink-0">{type}</div>
                  <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <motion.div className="h-full bg-yellow-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(rev / maxRevenue) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.35 + i * 0.08, ease: [0.22, 1, 0.36, 1] }} />
                  </div>
                  <div className="text-zinc-400 text-xs w-14 text-right flex-shrink-0">${rev.toLocaleString()}/mo</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

// ─── Slide-over ───────────────────────────────────────────────────────────────

function SlideOver({
  user, onClose, onSaved,
}: {
  user: AdminStats["users"][0];
  onClose: () => void;
  onSaved: (updated: AdminStats["users"][0]) => void;
}) {
  const [vapiAssistantId, setVapiAssistantId] = useState(user.vapiAssistantId ?? "");
  const [vapiPhoneNumberId, setVapiPhoneNumberId] = useState(user.vapiPhoneNumberId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  async function handleSave() {
    setSaving(true); setErr(""); setSaved(false);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vapiAssistantId: vapiAssistantId.trim(), vapiPhoneNumberId: vapiPhoneNumberId.trim() }),
      });
      if (!res.ok) throw new Error("Save failed");
      const { user: updated } = await res.json();
      setSaved(true);
      onSaved({ ...user, ...updated });
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setErr("Failed to save. Check the console.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 text-xs font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors";

  return (
    <>
      <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      <motion.div key="panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-zinc-900 border-l border-zinc-800 z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">Customer Details</h2>
            <button onClick={onClose} suppressHydrationWarning
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xl mb-6">
            {user.name.charAt(0)}
          </div>

          {/* Read-only info */}
          <div className="space-y-4 mb-8">
            {[
              { label: "Full Name",  value: user.name },
              { label: "Business",   value: user.business || "—" },
              { label: "Email",      value: user.email },
              { label: "Username",   value: user.username },
              { label: "Joined",     value: fmtDate(user.createdAt) },
              { label: "Plan",       value: user.plan ?? "none" },
              { label: "User ID",    value: user.id, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="border-b border-zinc-800 pb-4 last:border-0">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-white text-sm break-all ${mono ? "font-mono text-xs text-zinc-400" : "font-medium"}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Riley configuration — what the client filled in */}
          {user.profile && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 mb-4 space-y-3">
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Riley Configuration</p>
              {[
                { label: "Business Name",    value: user.profile.businessName },
                { label: "Business Type",    value: user.profile.businessType },
                { label: "Phone",            value: user.profile.phone },
                { label: "Location",         value: [user.profile.city, user.profile.state].filter(Boolean).join(", ") },
                { label: "Hours",            value: user.profile.hours },
                { label: "Services",         value: user.profile.services },
                { label: "Personality",      value: user.profile.personality },
                { label: "First Message",    value: user.profile.firstMessage },
                { label: "Instructions",     value: user.profile.instructions },
                { label: "After Hours",      value: user.profile.afterHoursMessage },
                { label: "Holiday Message",  value: user.profile.holidayMessage },
              ].filter(f => f.value).map(({ label, value }) => (
                <div key={label} className="border-b border-zinc-700/50 pb-2.5 last:border-0 last:pb-0">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-zinc-200 text-xs leading-snug">{value}</p>
                </div>
              ))}
            </div>
          )}
          {!user.profile && (
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-xl p-4 mb-4 text-center">
              <p className="text-zinc-500 text-xs">Client hasn&apos;t filled in their profile yet.</p>
            </div>
          )}

          {/* Vapi config — editable */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-4">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Vapi Configuration</p>
            <div>
              <label className="text-zinc-500 text-xs mb-1.5 block">Assistant ID</label>
              <input suppressHydrationWarning value={vapiAssistantId} onChange={(e) => setVapiAssistantId(e.target.value)}
                placeholder="e.g. 53b4c38e-c302-..." className={inputCls} />
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1.5 block">Phone Number ID</label>
              <input suppressHydrationWarning value={vapiPhoneNumberId} onChange={(e) => setVapiPhoneNumberId(e.target.value)}
                placeholder="e.g. ed57c052-6ec5-..." className={inputCls} />
            </div>
            {err && <p className="text-red-400 text-xs">{err}</p>}
            <button onClick={handleSave} disabled={saving} suppressHydrationWarning
              className="w-full py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 text-sm font-bold transition-colors disabled:opacity-50">
              {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Vapi Config"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────

function UsersTab({ users }: { users: AdminStats["users"] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminStats["users"][0] | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) ||
      u.business.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  return (
    <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl mb-4">Customers</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, business…" suppressHydrationWarning
              className="w-full bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-600 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-zinc-500 transition-colors" />
          </div>
          <div className="text-zinc-500 text-sm">{filtered.length} of {users.length}</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 bg-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          <span>Name</span><span>Business</span><span>Email</span><span>Joined</span><span></span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-600 text-sm">No results for &ldquo;{search}&rdquo;</div>
        ) : (
          filtered.map((user, i) => (
            <motion.div key={user.id}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              className={`grid grid-cols-[1fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3.5 border-t border-zinc-800 items-center hover:bg-zinc-800/50 transition-colors ${i % 2 === 0 ? "" : "bg-zinc-950/30"}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <span className="text-white text-sm font-medium truncate">{user.name}</span>
              </div>
              <span className="text-zinc-400 text-sm truncate">{user.business || "—"}</span>
              <span className="text-zinc-500 text-sm truncate">{user.email}</span>
              <span className="text-zinc-600 text-xs">{fmtShortDate(user.createdAt)}</span>
              <button onClick={() => setSelected(user)} suppressHydrationWarning
                className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
                <Eye className="w-3 h-3" />View
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Slide-over */}
      <AnimatePresence>
        {selected && (
          <SlideOver user={selected} onClose={() => setSelected(null)} onSaved={(updated) => setSelected(updated)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Calls Tab ────────────────────────────────────────────────────────────────

function CallsTab({ data }: { data: AdminStats }) {
  const { calls, answered, missed, totalSeconds } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const answerRate = (answered + missed) > 0 ? Math.round((answered / (answered + missed)) * 100) : 0;
  const sorted = [...calls].sort((a, b) => new Date(b.startedAt ?? 0).getTime() - new Date(a.startedAt ?? 0).getTime());

  return (
    <motion.div key="calls" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Call Logs</h1>
        <p className="text-zinc-500 text-sm mt-1">All calls handled by Riley — live from Vapi.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Calls" value={calls.length} icon={Phone} delay={0.05} />
        <StatCard label="Answered" value={answered} icon={PhoneCall} delay={0.1} trend={{ dir: "up", text: `${answerRate}% rate` }} />
        <StatCard label="Missed" value={missed} icon={PhoneMissed} delay={0.15} />
        <StatCard label="Total Talk Time" value={fmtDuration(totalSeconds)} icon={Clock} delay={0.2} />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[120px_1fr_80px_90px_40px] gap-4 px-5 py-3 bg-zinc-800 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
          <span>Status</span><span>Date</span><span>Duration</span><span>Type</span><span></span>
        </div>

        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <Phone className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-600 text-sm">No calls yet. Make a test call to see data here.</p>
          </div>
        ) : (
          sorted.map((c, i) => {
            const st = callStatus(c);
            const style = statusStyle[st];
            const isOpen = expandedId === c.id;
            return (
              <div key={c.id} className={`border-t border-zinc-800 ${i % 2 === 0 ? "" : "bg-zinc-950/30"}`}>
                <div className="grid grid-cols-[120px_1fr_80px_90px_40px] gap-4 px-5 py-3.5 items-center hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.badge}`}>{style.label}</span>
                  </div>
                  <span className="text-zinc-400 text-sm">{fmtDate(c.startedAt)}</span>
                  <span className="text-zinc-400 text-sm">{fmtDuration(c.durationSeconds)}</span>
                  <span className="text-zinc-600 text-xs capitalize">{c.type === "webCall" ? "Web" : "Phone"}</span>
                  <button onClick={() => setExpandedId(isOpen ? null : c.id)} suppressHydrationWarning
                    className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors">
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden">
                      <div className="px-5 pb-4 pt-1 space-y-3">
                        {c.transcript ? (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Mic className="w-3 h-3 text-zinc-500" />
                              <p className="text-zinc-500 text-xs uppercase tracking-wider">Transcript</p>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-400 text-xs leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
                              {c.transcript}
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-600 text-xs italic">No transcript available.</p>
                        )}
                        {c.endedReason && (
                          <p className="text-zinc-600 text-xs">Ended: <span className="text-zinc-500">{c.endedReason}</span></p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ data }: { data: AdminStats }) {
  const { users, calls } = data;

  const events = [
    ...users.map((u) => ({
      type: "signup" as const,
      date: u.createdAt,
      label: `${u.name} signed up`,
      sub: u.business,
      icon: UserPlus,
      color: "text-emerald-400",
    })),
    ...calls
      .filter((c) => c.startedAt)
      .map((c) => ({
        type: "call" as const,
        date: c.startedAt!,
        label: callStatus(c) === "missed" ? "Call missed" : "Call answered",
        sub: fmtDuration(c.durationSeconds),
        icon: callStatus(c) === "missed" ? PhoneMissed : PhoneCall,
        color: callStatus(c) === "missed" ? "text-red-400" : "text-zinc-400",
      })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);

  return (
    <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="mb-8">
        <h1 className="text-white font-bold text-2xl">Activity</h1>
        <p className="text-zinc-500 text-sm mt-1">All recent signups and calls in one feed.</p>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Activity className="w-10 h-10 text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-sm">No activity yet.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          {events.map((ev, i) => {
            const Icon = ev.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-center gap-4 px-5 py-3.5 border-t first:border-t-0 border-zinc-800 hover:bg-zinc-800/40 transition-colors`}>
                <div className={`w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 ${ev.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{ev.label}</p>
                  {ev.sub && <p className="text-zinc-500 text-xs">{ev.sub}</p>}
                </div>
                <p className="text-zinc-600 text-xs flex-shrink-0">{fmtDate(ev.date)}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ─── Admin Shell ──────────────────────────────────────────────────────────────

const NAV: { label: string; id: Tab; icon: React.ElementType }[] = [
  { label: "Overview", id: "overview", icon: LayoutDashboard },
  { label: "Growth",   id: "growth",   icon: TrendingUp },
  { label: "Revenue",  id: "revenue",  icon: DollarSign },
  { label: "Users",    id: "users",    icon: Users },
  { label: "Calls",    id: "calls",    icon: Phone },
  { label: "Activity", id: "activity", icon: Activity },
];

function AdminShell({ data, onLogout }: { data: AdminStats; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [liveData, setLiveData] = useState(data);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) setLiveData(await res.json());
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-zinc-900 border-r border-zinc-800 fixed top-0 left-0 h-full z-20">
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-zinc-800">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-zinc-900" />
          </div>
          <span className="text-white font-bold text-sm">Admin</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ label, id, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} suppressHydrationWarning
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === id ? "bg-white text-zinc-900" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-0.5 border-t border-zinc-800 pt-3">
          <button onClick={refresh} disabled={refreshing} suppressHydrationWarning
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-all">
            <RefreshCw className={`w-4 h-4 flex-shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button onClick={onLogout} suppressHydrationWarning
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-all">
            <LogOut className="w-4 h-4 flex-shrink-0" />Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
            <Shield className="w-3 h-3 text-zinc-900" />
          </div>
          <span className="text-white font-bold text-sm">Admin</span>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)} suppressHydrationWarning className="text-zinc-400">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="lg:hidden fixed top-14 left-0 right-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3 space-y-1 z-20">
            {NAV.map(({ label, id, icon: Icon }) => (
              <button key={id} onClick={() => { setTab(id); setMobileOpen(false); }} suppressHydrationWarning
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === id ? "bg-white text-zinc-900" : "text-zinc-400 hover:bg-zinc-800"
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
            <button onClick={onLogout} suppressHydrationWarning
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-600 hover:bg-zinc-800 transition-all">
              <LogOut className="w-4 h-4" />Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <AnimatePresence mode="wait">
            {tab === "overview" && <OverviewTab key="overview" data={liveData} />}
            {tab === "growth"   && <GrowthTab   key="growth"   data={liveData} />}
            {tab === "revenue"  && <RevenueTab  key="revenue"  data={liveData} />}
            {tab === "users"    && <UsersTab     key="users"    users={liveData.users} />}
            {tab === "calls"    && <CallsTab     key="calls"    data={liveData} />}
            {tab === "activity" && <ActivityTab  key="activity" data={liveData} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [adminData, setAdminData] = useState<AdminStats | null>(null);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.email) {
      setLoading(false);
      setAuthError(true);
      return;
    }
    // Fetch admin data — server will verify if user is admin
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401) { setAuthError(true); setLoading(false); return null; }
        return res.json();
      })
      .then((data) => { if (data) { setAdminData(data); setLoading(false); } })
      .catch(() => { setAuthError(true); setLoading(false); });
  }, [session, status]);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (authError || !adminData) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-xl flex items-center justify-center mb-6 mx-auto">
              <Lock className="w-5 h-5 text-zinc-400" />
            </div>
            <h1 className="text-white font-bold text-xl mb-2">Access Denied</h1>
            <p className="text-zinc-500 text-sm mb-6">
              {session?.user ? "Your account does not have admin access." : "Please sign in to access the admin panel."}
            </p>
            <a href={session?.user ? "/" : "/auth/login?callbackUrl=/admin"}
              className="inline-block w-full py-3 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm transition-colors">
              {session?.user ? "Go Home" : "Sign In"}
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return <AdminShell data={adminData} onLogout={() => signOut({ callbackUrl: "/auth/login" })} />;
}
