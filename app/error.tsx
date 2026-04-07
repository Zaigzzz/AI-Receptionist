"use client";

import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
            <svg width="18" height="16" viewBox="0 0 14 12" fill="none">
              <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="#09090b" />
              <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="#09090b" />
              <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="#09090b" />
              <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="#09090b" />
            </svg>
          </div>
        </div>

        <h1 className="font-display text-2xl font-extrabold text-white tracking-tight mb-3">
          Something went wrong
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed mb-8">
          An unexpected error occurred. Please try again.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-white hover:bg-zinc-100 text-[#09090b] font-bold text-sm py-3 px-6 rounded-xl transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
