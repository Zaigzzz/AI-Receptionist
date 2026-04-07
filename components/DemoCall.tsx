"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "connecting" | "active" | "ended";

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!;
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!;

const prompts = [
  { emoji: "🔧", text: "I have a leaky pipe under my sink" },
  { emoji: "🚿", text: "My water heater isn't working" },
  { emoji: "📅", text: "I'd like to book an appointment" },
  { emoji: "💧", text: "There's water damage in my basement" },
];

function WaveBar({ delay }: { delay: number }) {
  return (
    <motion.div
      className="w-1 rounded-full bg-white"
      animate={{ height: ["6px", "24px", "10px", "20px", "6px"] }}
      transition={{ duration: 1.2, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function FloatingCallWidget({
  status,
  isMuted,
  isSpeaking,
  duration,
  onMute,
  onEnd,
  onReset,
}: {
  status: CallStatus;
  isMuted: boolean;
  isSpeaking: boolean;
  duration: number;
  onMute: () => void;
  onEnd: () => void;
  onReset: () => void;
}) {
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const visible = status === "connecting" || status === "active" || status === "ended";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 120, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="fixed bottom-6 right-6 z-[9999] w-72 bg-[#09090b] rounded-3xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden"
        >
          {/* Header bar */}
          <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  status === "active"
                    ? "bg-white animate-pulse"
                    : status === "connecting"
                    ? "bg-zinc-400 animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                {status === "connecting"
                  ? "Connecting..."
                  : status === "active"
                  ? "On Call"
                  : "Call Ended"}
              </span>
            </div>
            {status === "active" && (
              <span className="text-zinc-400 text-xs font-mono">{fmt(duration)}</span>
            )}
          </div>

          {/* Body */}
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              {isSpeaking && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/10"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center relative z-10">
                <span className="text-white font-extrabold text-lg">R</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Riley</p>
              <p className="text-zinc-400 text-xs truncate">
                {status === "connecting"
                  ? "Connecting..."
                  : status === "active"
                  ? isSpeaking
                    ? "Speaking..."
                    : "Listening..."
                  : "Call finished"}
              </p>
              {status === "active" && (
                <div className="flex items-center gap-0.5 mt-1.5 h-4">
                  {isSpeaking ? (
                    [0, 0.1, 0.15, 0.05, 0.2].map((d, i) => (
                      <WaveBar key={i} delay={d} />
                    ))
                  ) : (
                    [0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-1 h-1.5 rounded-full bg-white/20" />
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {status === "active" && (
                <button
                  onClick={onMute}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isMuted
                      ? "bg-white/30 text-white"
                      : "bg-white/10 text-zinc-300 hover:bg-white/20"
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}

              {status === "ended" ? (
                <button
                  onClick={onReset}
                  className="bg-white hover:bg-zinc-100 text-zinc-900 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
                >
                  Call Again
                </button>
              ) : (
                <button
                  onClick={onEnd}
                  className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-all"
                >
                  <PhoneOff className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function DemoCall() {
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => {
    const vapi = new Vapi(VAPI_PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => { setCallStatus("active"); setCallDuration(0); });
    vapi.on("call-end", () => { setCallStatus("ended"); if (timerRef.current) clearInterval(timerRef.current); });
    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));
    vapi.on("error", () => { setCallStatus("idle"); });

    return () => { vapi.stop(); };
  }, []);

  useEffect(() => {
    if (callStatus === "active") {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const startCall = useCallback(async () => {
    const vapi = vapiRef.current;
    if (!vapi) return;
    setCallStatus("connecting");
    setCallDuration(0);
    try {
      await vapi.start(ASSISTANT_ID);
    } catch {
      setCallStatus("idle");
    }
  }, []);

  const endCall = useCallback(() => {
    vapiRef.current?.stop();
    setCallStatus("ended");
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return;
    const next = !isMuted;
    vapiRef.current.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const reset = () => {
    setCallStatus("idle");
    setIsMuted(false);
    setIsSpeaking(false);
    setCallDuration(0);
  };

  const isOnCall = callStatus === "connecting" || callStatus === "active";

  return (
    <>
      <FloatingCallWidget
        status={callStatus}
        isMuted={isMuted}
        isSpeaking={isSpeaking}
        duration={callDuration}
        onMute={toggleMute}
        onEnd={endCall}
        onReset={reset}
      />

      <section id="demo" className="py-24 bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            ref={sectionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-zinc-400 font-semibold text-xs uppercase tracking-widest mb-3">
              Live Demo
            </p>
            <h2 className="font-display text-4xl lg:text-5xl font-extrabold text-zinc-900 mb-4">
              Hear It For Yourself
            </h2>
            <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
              Click the button below and have a real conversation with Riley, our AI
              receptionist. Ask about services, book an appointment — she handles it all.
            </p>
          </motion.div>

          {/* Real phone call banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-2xl mx-auto mb-12 bg-[#09090b] rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Prefer a real phone call?</p>
                <p className="text-zinc-400 text-xs">Call Riley right now from your phone — no browser needed</p>
              </div>
            </div>
            <a
              href="tel:+16314303625"
              className="shrink-0 bg-white hover:bg-zinc-100 text-zinc-900 font-bold px-5 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap"
            >
              📞 +1 (631) 430-3625
            </a>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            {/* Left — prompts */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-2">
                Try saying something like...
              </h3>
              <p className="text-zinc-500 mb-6 text-sm">
                Riley answers as if she works for ProHome Plumbing. She can book
                appointments, answer questions, and collect your info.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {prompts.map((p) => (
                  <div
                    key={p.text}
                    className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-zinc-100 shadow-sm hover:border-zinc-200 transition-colors"
                  >
                    <span className="text-xl">{p.emoji}</span>
                    <p className="text-zinc-700 font-medium text-sm">&ldquo;{p.text}&rdquo;</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                🎤 Allow microphone access when prompted. Once you start the call, you can scroll freely — the call widget stays pinned to the bottom right corner.
              </p>
            </motion.div>

            {/* Right — Phone UI */}
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex justify-center"
            >
              <div className="w-72 bg-[#111111] rounded-[3rem] p-4 shadow-2xl shadow-black/30 border border-white/10">
                {/* Notch */}
                <div className="flex justify-center mb-3">
                  <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Screen */}
                <div className="bg-[#0a0a0a] rounded-[2.4rem] overflow-hidden min-h-[400px] flex flex-col items-center justify-between px-6 py-8">
                  <AnimatePresence mode="wait">
                    {callStatus === "idle" && (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-between h-full w-full"
                      >
                        <div className="text-center pt-2">
                          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-3">
                            AI Receptionist Demo
                          </p>
                          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-4xl font-extrabold font-display">R</span>
                          </div>
                          <h3 className="text-white text-2xl font-bold mb-1 font-display">Riley</h3>
                          <p className="text-zinc-500 text-sm">ProHome Plumbing</p>
                        </div>
                        <div className="flex flex-col items-center gap-3 pb-2">
                          <motion.button
                            onClick={startCall}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-20 h-20 rounded-full bg-white hover:bg-zinc-100 flex items-center justify-center shadow-xl transition-colors"
                          >
                            <Phone className="w-8 h-8 text-zinc-900" />
                          </motion.button>
                          <p className="text-zinc-400 text-sm font-medium">Tap to call</p>
                        </div>
                      </motion.div>
                    )}

                    {isOnCall && (
                      <motion.div
                        key="oncall"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full w-full gap-4"
                      >
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                          <Volume2 className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold mb-1">Call in progress</p>
                          <p className="text-zinc-400 text-sm">
                            {callStatus === "connecting" ? "Connecting..." : fmt(callDuration)}
                          </p>
                        </div>
                        <p className="text-zinc-500 text-xs text-center px-4">
                          Call widget is pinned to the bottom right — scroll freely
                        </p>
                      </motion.div>
                    )}

                    {callStatus === "ended" && (
                      <motion.div
                        key="ended"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full w-full gap-5"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                          <PhoneOff className="w-9 h-9 text-zinc-400" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-white text-xl font-bold mb-1 font-display">Call Ended</h3>
                          <p className="text-zinc-400 text-sm">{fmt(callDuration)}</p>
                        </div>
                        <button
                          onClick={reset}
                          className="bg-white hover:bg-zinc-100 text-zinc-900 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                        >
                          Call Again
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center mt-3">
                  <div className="w-24 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
