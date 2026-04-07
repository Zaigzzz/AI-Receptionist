"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Does it sound robotic?",
    a: "Not at all. Riley is trained to speak naturally and conversationally — warm, professional, and on-brand for your business. Try the live demo above and hear it for yourself.",
  },
  {
    q: "What if I want to take certain calls myself?",
    a: "You're in full control. You can set rules like 'always route VIP clients to me' or 'send me a live alert for emergencies' — Riley handles everything else.",
  },
  {
    q: "Can it actually book appointments?",
    a: "Riley collects all the details — caller name, issue, and preferred time — and sends you an instant summary so you can confirm the booking. Google Calendar sync is coming soon.",
  },
  {
    q: "What happens if the AI doesn't understand something?",
    a: "It gracefully escalates. It tells the caller 'Let me get someone to follow up with you shortly' and immediately sends you a detailed summary so you can call back within minutes.",
  },
  {
    q: "How long does setup take?",
    a: "Most businesses are live within 24 hours. You fill out a short form about your services and typical calls, we configure and test it, then flip it on.",
  },
  {
    q: "Is my customer data secure?",
    a: "Yes. All calls are encrypted, data is stored securely, and we never share or sell your information. We're fully GDPR and CCPA compliant.",
  },
  {
    q: "What if I want to cancel?",
    a: "No contracts, no cancellation fees. Cancel anytime from your dashboard. We think the results will speak for themselves.",
  },
];

function FAQItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="border-b border-zinc-100 last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
        suppressHydrationWarning
      >
        <span className="text-zinc-900 font-semibold text-base pr-8 group-hover:text-zinc-600 transition-colors">
          {item.q}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0 w-6 h-6 rounded-full border border-zinc-200 bg-zinc-50 flex items-center justify-center group-hover:border-zinc-400 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-zinc-500 text-sm leading-relaxed max-w-2xl">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-60px" });

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight mb-3">
            Got questions?
          </h2>
          <p className="text-zinc-500 text-lg">
            Everything you need to know before getting started.
          </p>
        </motion.div>

        {/* Accordion */}
        <div>
          {faqs.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Bottom nudge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={headerInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 text-zinc-400 text-sm"
        >
          Still have questions?{" "}
          <a
            href="mailto:hello@proanswer.ai"
            className="text-zinc-900 font-semibold underline underline-offset-2 hover:text-zinc-600 transition-colors"
          >
            Email us
          </a>{" "}
          — we reply within a few hours.
        </motion.p>
      </div>
    </section>
  );
}
