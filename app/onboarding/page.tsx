"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  UserPlus, Phone, Sparkles, Settings2, Zap,
  ArrowRight, Check, PhoneForwarded, Clock, MessageSquare,
  ToggleRight, Star, Shield,
} from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    id: "signup",
    number: "01",
    icon: UserPlus,
    label: "Sign Up",
    title: "Create Your Account & Pick a Plan",
    subtitle: "Two minutes. No credit card required to start.",
    description:
      "Head to our signup page, enter your business details, and choose the plan that fits. That's it — your account is live immediately.",
    details: [
      { icon: Check, text: "Business name, email, and password" },
      { icon: Check, text: "Choose Starter ($300/mo) or Pro ($500 setup + $150/mo)" },
      { icon: Check, text: "Instant dashboard access — no waiting" },
    ],
    cta: { label: "Create Your Account", href: "/auth/signup" },
  },
  {
    id: "build",
    number: "02",
    icon: Sparkles,
    label: "We Build Your AI",
    title: "We Build & Train Your AI Receptionist",
    subtitle: "Done for you, within 24 hours of payment.",
    description:
      "This is where ProAnswer is different. You don't configure a template and hope for the best — our team personally builds your AI receptionist from scratch, trained specifically on your business.",
    whiteGloveItems: [
      "We research your business, services, and typical caller questions",
      "We write a custom conversation script in your brand's voice",
      "We configure Riley with your exact business rules and escalation logic",
      "We run internal test calls before handing it over",
    ],
    badge: "Within 24 Hours",
    whiteGloveNote: "You'll receive an email confirmation when your AI is ready.",
  },
  {
    id: "number",
    number: "03",
    icon: Phone,
    label: "Your Number",
    title: "We Provision Your Dedicated Phone Number",
    subtitle: "A real business number — yours exclusively.",
    description:
      "Within 24 hours of your payment, we provision a dedicated phone number assigned to your AI receptionist. This number belongs to your account and is what callers will reach when they're forwarded.",
    numberDetails: [
      { icon: Shield, text: "Exclusively yours — no shared lines" },
      { icon: Clock, text: "Provisioned within 24 hours of payment" },
      { icon: Phone, text: "You'll receive your number by email" },
      { icon: MessageSquare, text: "Visible in your dashboard once assigned" },
    ],
    badge: "Within 24 Hours",
  },
  {
    id: "forward",
    number: "04",
    icon: PhoneForwarded,
    label: "Forward Your Number",
    title: "Forward Your Existing Number to Riley",
    subtitle: "Keep your number. Takes 60 seconds.",
    description:
      "Once you have your ProAnswer number, set up call forwarding from your current business phone. Your clients keep calling the same number they always have — Riley answers on your behalf.",
    forwardingSteps: [
      { code: "*72 [your ProAnswer number]", label: "Dial this from your business phone" },
      { code: "Listen for tone", label: "You'll hear a confirmation beep or voice prompt" },
      { code: "Hang up", label: "Forwarding is now active — that's it" },
    ],
    forwardNote: "Works with AT&T, Verizon, T-Mobile, Google Voice, and most VoIP providers. To disable forwarding at any time, dial *73.",
    highlighted: true,
  },
  {
    id: "configure",
    number: "05",
    icon: Settings2,
    label: "Configure",
    title: "Fine-Tune Riley in Your Dashboard",
    subtitle: "Every change goes live instantly.",
    description:
      "Log into your dashboard and fill in your business profile. Riley reads this in real time — update your hours, services, or greeting and the AI reflects it on the very next call.",
    details: [
      { icon: Clock,         text: "Business hours & after-hours message" },
      { icon: MessageSquare, text: "Services offered & special instructions" },
      { icon: Check,         text: "Custom greeting script in your voice" },
      { icon: Check,         text: "Holiday closure messages" },
    ],
  },
  {
    id: "golive",
    number: "06",
    icon: Zap,
    label: "Go Live",
    title: "Make a Test Call, Then Go Live",
    subtitle: "One toggle. Every call answered forever.",
    description:
      "Call your own business number from any phone and experience Riley firsthand. Check the transcript in your dashboard. When you're happy, flip the Live switch — from that moment, every call is answered 24/7.",
    details: [
      { icon: Check, text: "Call your number from any device" },
      { icon: Check, text: "Ask your most common caller questions" },
      { icon: Check, text: "Review the full transcript in your dashboard" },
      { icon: Check, text: "Make last-minute tweaks, then flip the switch" },
    ],
    isLast: true,
  },
];

// ── Step Card ─────────────────────────────────────────────────────────────────

function StepCard({ step }: { step: (typeof STEPS)[0] }) {
  const ref   = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon   = step.icon;

  return (
    <motion.div
      id={step.id}
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-28"
    >
      {/* Header */}
      <div className="flex items-start gap-5 mb-6">
        <div className="shrink-0 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-[#09090b] flex items-center justify-center shadow-md">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {!("isLast" in step && step.isLast) && (
            <div className="w-px h-8 bg-zinc-200 mt-2" />
          )}
        </div>
        <div className="flex-1 pt-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Step {step.number}</span>
          <h2 className="font-display text-2xl lg:text-3xl font-extrabold text-zinc-900 mb-1 leading-tight mt-0.5">
            {step.title}
          </h2>
          <p className="text-sm font-semibold text-zinc-500">{step.subtitle}</p>
        </div>
      </div>

      {/* Card body */}
      <div className="ml-0 lg:ml-19 bg-white border border-zinc-100 rounded-2xl p-6 lg:p-8 shadow-sm hover:border-zinc-200 transition-all duration-300">
        <p className="text-zinc-600 leading-relaxed mb-6 text-base">{step.description}</p>

        {/* Standard detail list */}
        {"details" in step && step.details && (
          <ul className="space-y-3">
            {step.details.map((d, i) => {
              const DIcon = d.icon;
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                    <DIcon className="w-3 h-3 text-zinc-700" />
                  </span>
                  <span className="text-sm text-zinc-600 font-medium">{d.text}</span>
                </li>
              );
            })}
          </ul>
        )}

        {/* CTA (step 1) */}
        {"cta" in step && step.cta && (
          <div className="mt-6">
            <Link
              href={step.cta.href}
              className="inline-flex items-center gap-2 bg-[#09090b] hover:bg-zinc-800 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-sm group/btn"
            >
              {step.cta.label}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* White-glove build (step 2) */}
        {"whiteGloveItems" in step && step.whiteGloveItems && (
          <>
            {"badge" in step && step.badge && (
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Star className="w-3 h-3 fill-white" />
                  {step.badge}
                </span>
                <span className="text-xs text-zinc-400 font-medium">of payment</span>
              </div>
            )}
            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3">
              {step.whiteGloveItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-sm text-zinc-700 font-medium leading-snug">{item}</span>
                </motion.div>
              ))}
            </div>
            {"whiteGloveNote" in step && step.whiteGloveNote && (
              <p className="text-xs text-zinc-400 mt-4 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                {step.whiteGloveNote}
              </p>
            )}
          </>
        )}

        {/* Number provisioning (step 3) */}
        {"numberDetails" in step && step.numberDetails && (
          <>
            {"badge" in step && step.badge && (
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {step.badge}
                </span>
                <span className="text-xs text-zinc-400 font-medium">of payment</span>
              </div>
            )}
            <ul className="space-y-3">
              {step.numberDetails.map((d, i) => {
                const DIcon = d.icon;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <DIcon className="w-3 h-3 text-zinc-700" />
                    </span>
                    <span className="text-sm text-zinc-600 font-medium">{d.text}</span>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Call forwarding (step 4) */}
        {"forwardingSteps" in step && step.forwardingSteps && (
          <>
            <div className="bg-zinc-950 rounded-xl p-5 mb-4 space-y-4">
              {step.forwardingSteps.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-400">
                    {i + 1}
                  </span>
                  <div>
                    <code className="text-white font-mono text-sm font-bold">{s.code}</code>
                    <p className="text-zinc-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {"forwardNote" in step && step.forwardNote && (
              <p className="text-xs text-zinc-400 leading-relaxed">{step.forwardNote}</p>
            )}
          </>
        )}

        {/* Go live toggle (step 6) */}
        {"isLast" in step && step.isLast && (
          <div className="mt-6 flex items-center gap-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4">
            <div className="w-16 h-8 bg-zinc-900 rounded-full flex items-center justify-end pr-1 shadow-sm">
              <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
            </div>
            <div>
              <p className="font-bold text-zinc-900 text-sm">AI Receptionist — LIVE</p>
              <p className="text-xs text-zinc-500">Answering calls 24/7 right now</p>
            </div>
            <ToggleRight className="ml-auto w-5 h-5 text-zinc-400" />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-white pt-28 pb-16 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-zinc-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
              Setup Guide
            </span>
            <h1 className="font-display text-4xl lg:text-6xl font-extrabold text-zinc-900 mb-4 leading-tight tracking-tight">
              Your AI Receptionist,
              <span className="block text-zinc-400">Live in Under 24 Hours</span>
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              Sign up, we build and configure everything for you, and your phone line is
              answered 24/7 — no technical setup required on your end.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-12 mt-10"
          >
            {[
              { value: "6",       label: "Simple Steps"   },
              { value: "24hrs",   label: "We're Live"     },
              { value: "24/7",    label: "Coverage After" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-zinc-900">{stat.value}</p>
                <p className="text-sm text-zinc-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Main layout */}
      <div className="bg-zinc-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16">
          <div className="space-y-14">
            {STEPS.map((step) => (
              <StepCard key={step.id} step={step} />
            ))}

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-3xl bg-[#09090b] p-10 lg:p-14 text-center shadow-2xl"
            >
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-display text-3xl lg:text-4xl font-extrabold text-white mb-3">
                  Ready to Stop Missing Calls?
                </h2>
                <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                  Create your account in two minutes. We'll handle the rest — your AI
                  receptionist is live within 24 hours.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 bg-white text-zinc-900 font-bold px-8 py-4 rounded-2xl shadow-sm hover:bg-zinc-100 hover:scale-105 transition-all duration-200 text-base"
                  >
                    Create Your Account
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/#demo"
                    className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-semibold text-sm transition-colors"
                  >
                    Hear Riley First
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="h-8" />
          </div>
        </div>
      </div>
    </>
  );
}
