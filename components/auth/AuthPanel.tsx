"use client";

import { motion } from "framer-motion";
import { Phone, Star } from "lucide-react";
import Link from "next/link";

export default function AuthPanel() {
  return (
    <motion.div
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-[#14532d] w-[46%] shrink-0 p-12 xl:p-16"
    >
      {/* Geometric ring decorations */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full border border-white/10" />
      <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full border border-white/8" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full border border-white/10" />
      <div className="absolute top-1/3 -right-20 w-56 h-56 rounded-full border border-white/8" />
      <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full border border-white/10" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#052e16]/60 to-transparent" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #22c55e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top — Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e] flex items-center justify-center shadow-lg shadow-green-900/40">
            <Phone className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight">
            Pro<span className="text-[#4ade80]">Answer</span>
          </span>
        </Link>
      </div>

      {/* Middle — Tagline */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-4">
            AI Receptionist Platform
          </p>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            Every call answered.
            <br />
            <span className="text-[#4ade80]">Every opportunity</span>
            <br />
            captured.
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            Join thousands of home service businesses running 24/7 — without hiring extra staff.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex gap-8 mt-10"
        >
          {[
            { value: "98%", label: "Answer rate" },
            { value: "24/7", label: "Always on" },
            { value: "< 2s", label: "Response time" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/50 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom — Testimonial card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-xl"
      >
        {/* Stars */}
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-[#fbbf24] text-[#fbbf24]" />
          ))}
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-4 italic">
          &ldquo;We went from missing 40% of our calls to zero. ProAnswer paid for itself in the
          first week.&rdquo;
        </p>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#22c55e]/30 border border-[#22c55e]/50 flex items-center justify-center">
            <span className="text-xs font-bold text-[#4ade80]">MT</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Marcus T.</p>
            <p className="text-white/50 text-xs">HVAC Business Owner</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
