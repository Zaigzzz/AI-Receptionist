"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 relative overflow-hidden bg-[#09090b]">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-zinc-500 font-semibold text-xs uppercase tracking-widest mb-4">
            Get Started Today
          </p>
          <h2 className="font-display text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
            Ready to Stop
            <br />
            Missing Calls?
          </h2>
          <p className="text-lg text-zinc-400 mb-10 max-w-2xl mx-auto">
            Stop losing jobs to missed calls. Set up in under 24 hours — Riley answers every call, books appointments, and sends you instant summaries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center h-14 bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-base px-10 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all group"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#demo"
              className="inline-flex items-center justify-center h-14 border border-white/20 hover:border-white/40 text-white font-bold text-base px-10 rounded-2xl transition-all"
            >
              Try the Demo First
            </a>
          </div>

          <p className="text-zinc-600 text-sm mt-6">
            No contracts · Cancel anytime · Live in 24 hours
          </p>
        </motion.div>
      </div>
    </section>
  );
}
