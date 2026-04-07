"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "assistant"; content: string };

const quickReplies = [
  { label: "I have a leaky pipe 🔧", value: "I have a leaky pipe and need someone to fix it" },
  { label: "What are your hours? ⏰", value: "What are your business hours?" },
  { label: "Book an appointment 📅", value: "I'd like to book an appointment" },
];

const initialMessages: Message[] = [
  {
    role: "assistant",
    content:
      "Hi there! 👋 You've reached ProHome Services. I'm your AI receptionist. How can I help you today?",
  },
];

export default function DemoChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <section id="demo" className="py-24 bg-[#f0fdf4]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[#22c55e] font-bold text-sm uppercase tracking-widest mb-3">
            Live Demo
          </p>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#14532d] mb-4">
            Try ProAnswer Live
          </h2>
          <p className="text-lg text-[#4b7a5a] max-w-2xl mx-auto">
            Chat with our AI receptionist right now. Ask about services, book an
            appointment, or see how it handles any situation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={sectionInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-lg mx-auto"
        >
          {/* Phone frame */}
          <div className="bg-[#0f3d21] rounded-[3rem] p-4 shadow-2xl shadow-green-900/30 border-4 border-[#1a5c34]">
            {/* Notch */}
            <div className="flex justify-center mb-3">
              <div className="w-28 h-7 bg-[#0a2e18] rounded-full flex items-center justify-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#1a5c34]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]/30" />
              </div>
            </div>

            {/* Screen */}
            <div className="bg-[#f0fdf4] rounded-[2.4rem] overflow-hidden flex flex-col h-[520px]">
              {/* Header */}
              <div className="bg-[#22c55e] px-5 py-4 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">PA</span>
                </div>
                <div>
                  <p className="text-white font-bold">ProAnswer AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#6ee7b7] animate-pulse" />
                    <p className="text-green-100 text-xs font-medium">Online • Ready to help</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium ${
                          msg.role === "user"
                            ? "bg-[#22c55e] text-white rounded-tr-sm"
                            : "bg-white text-[#14532d] rounded-tl-sm shadow-sm border border-green-100"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading dots */}
                  {loading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-green-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] dot-1" />
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] dot-2" />
                        <div className="w-2 h-2 rounded-full bg-[#22c55e] dot-3" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {quickReplies.map((qr) => (
                    <button
                      key={qr.value}
                      onClick={() => sendMessage(qr.value)}
                      className="text-xs bg-white border border-green-200 text-[#16a34a] font-semibold px-3 py-1.5 rounded-full hover:bg-[#dcfce7] hover:border-green-300 transition-colors"
                    >
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="px-4 pb-5 pt-2 flex gap-2 flex-shrink-0">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border-green-200 bg-white focus-visible:ring-[#22c55e] text-sm text-[#14532d] placeholder:text-[#4b7a5a]/60"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-[#22c55e] hover:bg-[#16a34a] rounded-xl shadow-sm flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-white" />
                </Button>
              </form>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center mt-3">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-[#4b7a5a] mt-4">
            This is a live AI demo. Responses are generated in real-time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
