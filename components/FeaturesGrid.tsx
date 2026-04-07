"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Moon, Zap, CalendarCheck, Globe, FileText, Settings2, LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Moon,
    title: "24/7 Availability",
    description: "Never sleeps, never takes a day off. Every call answered — midnight, holidays, you name it.",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description: "Answers in under 2 seconds. No hold music, no voicemail — just a helpful voice ready to assist.",
  },
  {
    icon: CalendarCheck,
    title: "Appointment Booking",
    description: "Syncs with your calendar and books jobs automatically. You wake up to a full schedule.",
  },
  {
    icon: Globe,
    title: "Bilingual Support",
    description: "Speaks English and Spanish fluently. Serve a wider customer base and never lose a caller.",
  },
  {
    icon: FileText,
    title: "Call Summaries",
    description: "Every call generates a crisp summary — caller name, issue, contact info, and next steps.",
  },
  {
    icon: Settings2,
    title: "Custom Scripts",
    description: "Trained on your exact services, pricing info, and brand voice. Sounds like you, not a robot.",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true, margin: "-40px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={cardInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl p-7 border border-zinc-100 hover:border-zinc-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 group cursor-default"
    >
      <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#09090b] transition-all duration-300">
        <Icon className="w-6 h-6 text-zinc-600 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="font-display text-lg font-bold text-zinc-900 mb-2">{feature.title}</h3>
      <p className="text-zinc-500 leading-relaxed text-sm">{feature.description}</p>
    </motion.div>
  );
}

export default function FeaturesGrid() {
  const headingRef = useRef(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-50px" });

  return (
    <section id="features" className="py-24 bg-white border-b border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={headingRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headingInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
            ProAnswer comes packed with everything a home service business needs to
            capture every lead and delight every caller.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
