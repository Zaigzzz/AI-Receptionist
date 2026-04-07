"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { PhoneIncoming, Bot, ClipboardList } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: PhoneIncoming,
    title: "Client Calls",
    description:
      "Your regular business number rings ProAnswer. Your clients won't know the difference — it sounds exactly like your company.",
    detail: "Works with your existing number",
  },
  {
    number: "02",
    icon: Bot,
    title: "AI Answers Instantly",
    description:
      "ProAnswer greets callers in your brand's voice, collects their name and issue, and books appointments — all in seconds.",
    detail: "< 2 second response time",
  },
  {
    number: "03",
    icon: ClipboardList,
    title: "You Get a Summary",
    description:
      "The moment the call ends, you receive an instant SMS and email with the caller's details, the issue, and any appointment that was booked.",
    detail: "Instant SMS + email notification",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const stepRef = useRef(null);
  const stepInView = useInView(stepRef, { once: true, margin: "-50px" });
  const Icon = step.icon;

  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0, y: 40 }}
      animate={stepInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-white shadow-lg shadow-black/5 border border-zinc-100 flex items-center justify-center group hover:border-zinc-300 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-[#09090b] rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold font-display">{step.number}</span>
        </div>
      </div>

      <h3 className="font-display text-2xl font-bold text-zinc-900 mb-3">{step.title}</h3>
      <p className="text-zinc-500 leading-relaxed mb-4 max-w-xs text-sm">{step.description}</p>

      <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-zinc-200">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
        {step.detail}
      </span>
    </motion.div>
  );
}

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="py-24 bg-zinc-50 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-3">
            Simple Process
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-4">
            How ProAnswer Works
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Set it up in minutes. From that moment on, every call gets answered.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-16 left-[calc(16.67%-1px)] right-[calc(16.67%-1px)] h-px bg-zinc-200 z-0" />

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <StepCard key={step.number} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
