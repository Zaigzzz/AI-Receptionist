"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Calendar,
  Briefcase,
  Settings2,
  Home,
  DollarSign,
  Zap,
  Phone,
} from "lucide-react";

const integrations = [
  { name: "Google Calendar", icon: Calendar },
  { name: "Jobber", icon: Briefcase },
  { name: "ServiceTitan", icon: Settings2 },
  { name: "Housecall Pro", icon: Home },
  { name: "QuickBooks", icon: DollarSign },
  { name: "Zapier", icon: Zap },
  { name: "Twilio", icon: Phone },
];

export default function IntegrationLogos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section className="py-5 bg-white border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={ref}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8"
        >
          {/* Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="text-zinc-400 text-xs font-semibold tracking-widest uppercase whitespace-nowrap flex-shrink-0"
          >
            Works with your existing tools
          </motion.p>

          {/* Divider (desktop only) */}
          <div className="hidden sm:block w-px h-5 bg-zinc-200 flex-shrink-0" />

          {/* Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {integrations.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + i * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-medium px-3 py-1.5 rounded-full hover:border-zinc-300 hover:text-zinc-900 transition-colors cursor-default"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
