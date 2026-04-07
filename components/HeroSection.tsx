"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Phone, Calendar, MessageSquare } from "lucide-react";

const chatMessages = [
  { from: "ai", text: "Hi! You've reached ProHome Services. How can I help you today?" },
  { from: "user", text: "Hi, my water heater stopped working" },
  { from: "ai", text: "I can get a technician out to you. Can I get your name and address?" },
  { from: "user", text: "John Smith, 142 Oak Street" },
  { from: "ai", text: "Got it John! We have availability tomorrow 9 AM–12 PM. Does that work?" },
];

export default function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 bg-white overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, #09090b 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left copy ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-600 font-semibold px-4 py-1.5 text-xs rounded-full mb-6 tracking-wide uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 inline-block" />
                Built for Home Service Businesses
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display text-5xl lg:text-6xl xl:text-7xl font-extrabold text-[#09090b] leading-[1.05] tracking-tight mb-6"
            >
              Never Miss a{" "}
              <span className="relative inline-block">
                Client Call
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none">
                  <path d="M2 6C50 2 100 1 150 2C200 3 250 5 298 4" stroke="#09090b" strokeWidth="2" strokeLinecap="round" opacity="0.2"/>
                </svg>
              </span>{" "}
              Again.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg text-zinc-500 leading-relaxed mb-8 max-w-xl"
            >
              ProAnswer answers every call 24/7 — nights, weekends, and while
              you&apos;re on the job.{" "}
              <strong className="text-zinc-900">More calls answered = more jobs booked.</strong>
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col gap-2.5 mb-10"
            >
              {[
                "Answers calls in under 2 seconds",
                "Books appointments automatically",
                "Sends you instant job summaries",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-zinc-600 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-zinc-900 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#demo"
                className="inline-flex items-center justify-center bg-[#09090b] hover:bg-zinc-800 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-sm hover:-translate-y-0.5 transition-all group"
              >
                Try Live Demo
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center border-2 border-zinc-200 hover:border-zinc-400 text-zinc-700 hover:text-zinc-900 font-bold text-base px-8 py-4 rounded-2xl transition-all bg-transparent"
              >
                See How It Works
              </a>
            </motion.div>
          </div>

          {/* ── Right — iPhone ── */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative" style={{ marginRight: "60px" }}>

              {/* ─── iPhone Frame ─── */}
              <div
                className="relative shadow-2xl shadow-black/20"
                style={{
                  width: "300px",
                  height: "620px",
                  borderRadius: "52px",
                  background: "linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #111 100%)",
                  padding: "3px",
                  boxShadow: "0 0 0 1px #3a3a3a, inset 0 0 0 1px #444, 0 40px 80px rgba(0,0,0,0.3)",
                }}
              >
                {/* Side buttons */}
                <div className="absolute -left-[3px] top-[120px] w-[3px] h-[36px] bg-[#333] rounded-l-sm" />
                <div className="absolute -left-[3px] top-[168px] w-[3px] h-[64px] bg-[#333] rounded-l-sm" />
                <div className="absolute -left-[3px] top-[244px] w-[3px] h-[64px] bg-[#333] rounded-l-sm" />
                <div className="absolute -right-[3px] top-[168px] w-[3px] h-[80px] bg-[#333] rounded-r-sm" />

                {/* Screen */}
                <div
                  className="relative w-full h-full overflow-hidden bg-black"
                  style={{ borderRadius: "50px" }}
                >
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-7 pt-4 pb-1 relative z-10">
                    <span className="text-white text-xs font-semibold tracking-tight">9:41</span>
                    <div
                      className="absolute left-1/2 -translate-x-1/2 top-3 bg-black flex items-center gap-1.5 px-3 py-1"
                      style={{ borderRadius: "20px", width: "110px", height: "32px", justifyContent: "center" }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a1a] border border-[#333]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-end gap-[2px] h-3">
                        {[3, 5, 7, 9].map((h, i) => (
                          <div key={i} className="w-[3px] bg-white rounded-sm" style={{ height: `${h}px` }} />
                        ))}
                      </div>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M7 8.5C7.552 8.5 8 8.948 8 9.5C8 10.052 7.552 10.5 7 10.5C6.448 10.5 6 10.052 6 9.5C6 8.948 6.448 8.5 7 8.5Z" fill="white"/>
                        <path d="M3.5 5.5C4.5 4.3 5.7 3.5 7 3.5C8.3 3.5 9.5 4.3 10.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M1 2.5C2.8 0.9 4.8 0 7 0C9.2 0 11.2 0.9 13 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <div className="flex items-center gap-[2px]">
                        <div className="w-6 h-3 border border-white/70 rounded-[3px] p-[2px]">
                          <div className="w-full h-full bg-white rounded-[1px]" />
                        </div>
                        <div className="w-[2px] h-1.5 bg-white/50 rounded-r-sm" />
                      </div>
                    </div>
                  </div>

                  {/* App screen */}
                  <div className="flex flex-col h-[calc(100%-48px)]">
                    {/* Chat header */}
                    <div
                      className="px-4 py-3 flex items-center gap-3 border-b"
                      style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-white border-2 border-[#111]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-sm">ProAnswer AI</p>
                        <p className="text-white/40 text-xs">● Online now</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 px-3 py-3 flex flex-col gap-2.5 overflow-hidden" style={{ background: "#fafafa" }}>
                      <div className="text-center">
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Today</span>
                      </div>

                      {chatMessages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.9 + i * 0.45, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          className={`flex items-end gap-1.5 ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.from === "ai" && (
                            <div className="w-6 h-6 rounded-full bg-[#09090b] flex items-center justify-center flex-shrink-0 mb-0.5">
                              <span className="text-white text-[9px] font-bold">PA</span>
                            </div>
                          )}
                          <div
                            className={`max-w-[78%] px-3 py-2 text-[11px] leading-relaxed font-medium shadow-sm ${
                              msg.from === "ai"
                                ? "bg-white text-zinc-800 rounded-2xl rounded-bl-sm border border-zinc-100"
                                : "bg-[#09090b] text-white rounded-2xl rounded-br-sm"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </motion.div>
                      ))}

                      {/* Typing indicator */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 3.5 }}
                        className="flex items-end gap-1.5"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#09090b] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-bold">PA</span>
                        </div>
                        <div className="bg-white border border-zinc-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
                          <motion.div className="w-1.5 h-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} />
                          <motion.div className="w-1.5 h-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }} />
                          <motion.div className="w-1.5 h-1.5 rounded-full bg-zinc-400" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Input bar */}
                    <div className="px-3 py-2.5 flex items-center gap-2 border-t bg-white" style={{ borderColor: "#f0f0f0" }}>
                      <div className="flex-1 bg-zinc-100 rounded-full px-4 py-2 text-[11px] text-zinc-400 font-medium">
                        iMessage
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#09090b] flex items-center justify-center">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="flex justify-center pb-2 pt-1 bg-white">
                      <div className="w-28 h-1 bg-black/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── Floating Popouts ─── */}

              {/* Top-left — Call answered */}
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 2.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -left-36 top-16 bg-white rounded-2xl shadow-xl shadow-black/8 border border-zinc-100 p-3 flex items-center gap-3 w-44"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#09090b] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">Call Answered</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">in 1.2 seconds</p>
                  <div className="flex gap-0.5 mt-1 items-end">
                    {[4, 7, 5, 8, 4].map((h, i) => (
                      <div key={i} className="w-1 rounded-full bg-zinc-800" style={{ height: `${h}px` }} />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Bottom-left — Appointment booked */}
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 2.7, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -left-36 bottom-28 bg-white rounded-2xl shadow-xl shadow-black/8 border border-zinc-100 p-3 flex items-center gap-3 w-44"
              >
                <div className="w-11 h-11 rounded-2xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-zinc-800" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">Job Booked!</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Tomorrow 9–12 PM</p>
                  <p className="text-[10px] text-zinc-600 font-semibold mt-0.5">Added to calendar ✓</p>
                </div>
              </motion.div>

              {/* Right — New message */}
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 3.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-36 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl shadow-black/8 border border-zinc-100 p-3 flex items-center gap-3 w-40"
              >
                <div className="w-11 h-11 rounded-2xl bg-[#09090b] flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 leading-tight">Summary Sent</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">via SMS + Email</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse" />
                    <p className="text-[10px] text-zinc-600 font-semibold">Delivered</p>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-zinc-100" />
    </section>
  );
}
