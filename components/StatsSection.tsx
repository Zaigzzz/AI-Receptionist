"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Quote } from "lucide-react";

const stats = [
  { value: "24/7", label: "Always on — nights, weekends, holidays" },
  { value: "< 2s", label: "Average answer time" },
  { value: "0", label: "Calls go to voicemail" },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 bg-[#09090b] relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Stats */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-8 lg:gap-12 mb-20"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.value}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <div className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-2">
                {stat.value}
              </div>
              <p className="text-zinc-400 text-sm lg:text-base font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="border-t border-white/10 mb-16" />

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Quote className="w-6 h-6 text-zinc-400" />
          </div>
          <blockquote className="font-display text-2xl lg:text-3xl font-bold text-white leading-relaxed mb-8 italic">
            &ldquo;I used to miss 6–8 calls a week. Now ProAnswer handles everything
            after hours.{" "}
            <span className="text-zinc-400 not-italic font-semibold">
              Best investment I&apos;ve made.
            </span>
            &rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white text-lg">
              M
            </div>
            <div className="text-left">
              <p className="text-white font-bold">Mike R.</p>
              <p className="text-zinc-500 text-sm">HVAC Contractor, Dallas TX</p>
            </div>
            <div className="flex gap-1 ml-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-white text-white opacity-80" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
