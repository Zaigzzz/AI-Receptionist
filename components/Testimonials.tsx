"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    initials: "MD",
    name: "Mike D.",
    trade: "HVAC Owner",
    location: "Austin, TX",
    quote:
      "I was losing jobs every night when I shut off my phone. First week with the AI receptionist I got 6 after-hours bookings I would've completely missed. It paid for itself on day 3.",
    stat: "+$5,400",
    statLabel: "first month",
  },
  {
    initials: "SL",
    name: "Sarah L.",
    trade: "Plumbing Co.",
    location: "Denver, CO",
    quote:
      "We were drowning in calls during busy season and couldn't hire fast enough. The AI handles the intake perfectly — customers can't even tell it's not a person.",
    stat: "94%",
    statLabel: "caller satisfaction",
  },
  {
    initials: "JR",
    name: "James R.",
    trade: "Roofing & Gutters",
    location: "Nashville, TN",
    quote:
      "Skeptical at first but the setup took less than a day. Now I don't even think about missed calls. It books, it follows up, it just works.",
    stat: "0",
    statLabel: "missed calls in 60 days",
  },
];

function TestimonialCard({
  t,
  index,
}: {
  t: (typeof testimonials)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Decorative quote mark */}
      <div className="text-7xl font-serif leading-none text-zinc-100 select-none mb-2 -mt-2">
        &ldquo;
      </div>

      {/* Quote */}
      <p className="text-zinc-700 text-base leading-relaxed font-medium flex-1 mb-6">
        {t.quote}
      </p>

      {/* Divider */}
      <div className="border-t border-zinc-100 pt-6">
        <div className="flex items-center justify-between">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {t.initials}
            </div>
            <div>
              <p className="text-zinc-900 font-bold text-sm">{t.name}</p>
              <p className="text-zinc-500 text-xs">
                {t.trade} · {t.location}
              </p>
            </div>
          </div>

          {/* Stat badge */}
          <div className="text-right">
            <div className="text-zinc-900 font-extrabold text-lg leading-none">
              {t.stat}
            </div>
            <div className="text-zinc-400 text-xs mt-0.5">{t.statLabel}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="py-24 bg-zinc-50 relative overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #09090b 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-600 font-semibold px-4 py-1.5 text-xs rounded-full mb-5 tracking-wide uppercase shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 inline-block" />
            Join 500+ owners
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight">
            Home service businesses trust us
          </h2>
          <p className="mt-4 text-zinc-500 text-lg max-w-xl mx-auto">
            Real results from real owners — not hand-picked edge cases.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} t={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
