"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MoonStar, HardHat, DollarSign } from "lucide-react";

const pains = [
  {
    icon: MoonStar,
    title: "Missed calls after hours",
    stat: "73%",
    statLabel: "of callers won't leave a voicemail",
    description:
      "If you miss it, you lose it. Your competitors are picking up while you're unavailable.",
  },
  {
    icon: HardHat,
    title: "Too busy on the job",
    stat: "8–12",
    statLabel: "calls missed per week on average",
    description:
      "You can't answer calls when you're under a sink, on a roof, or dealing with a customer.",
  },
  {
    icon: DollarSign,
    title: "Can't afford full-time staff",
    stat: "$35k+",
    statLabel: "per year for a receptionist",
    description:
      "ProAnswer handles every call for a fraction of the cost — no benefits, no sick days, no training.",
  },
];

function PainCard({ pain, index }: { pain: (typeof pains)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const Icon = pain.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-zinc-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="w-12 h-12 bg-[#09090b] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-white" />
      </div>

      <div className="mb-2">
        <span className="font-display text-4xl font-extrabold text-[#09090b]">{pain.stat}</span>
        <p className="text-sm text-zinc-500 font-medium mt-1">{pain.statLabel}</p>
      </div>

      <h3 className="font-display text-xl font-bold text-zinc-900 mb-3">{pain.title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{pain.description}</p>
    </motion.div>
  );
}

export default function PainPoints() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-50px" });

  return (
    <section className="py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-3">
            The Problem
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-4">
            Sound Familiar?
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            Every missed call is a missed paycheck. Home service businesses lose
            thousands every month to unanswered phones.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pains.map((pain, i) => (
            <PainCard key={pain.title} pain={pain} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
