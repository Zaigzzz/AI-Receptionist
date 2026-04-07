"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Demo", href: "/#demo" },
  { label: "Setup Guide", href: "/onboarding" },
];

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-[#09090b] flex items-center justify-center flex-shrink-0">
      <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
        <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="white" />
        <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="white" />
        <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="white" />
        <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="white" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const username = (session?.user as { username?: string })?.username ?? session?.user?.name;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-200"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <LogoMark />
          <span className="font-display font-bold text-xl text-[#09090b] tracking-tight">
            ProAnswer
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA / User area */}
        <div className="hidden md:flex items-center gap-3">
          {status === "loading" ? (
            <div className="w-24 h-8 bg-zinc-100 rounded-xl animate-pulse" />
          ) : session ? (
            <>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#09090b] hover:bg-zinc-800 text-white font-semibold px-4 py-2 rounded-xl transition-all text-sm shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 hover:border-zinc-400 text-zinc-900 font-semibold px-3 py-2 rounded-xl transition-all text-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-[#09090b] flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  {username}
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden py-1"
                    >
                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/auth/login" }); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors px-1"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center border border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 font-semibold px-4 py-2 rounded-xl transition-all text-sm"
              >
                Sign Up
              </Link>
              <a
                href="/#demo"
                className="inline-flex items-center justify-center bg-[#09090b] hover:bg-zinc-800 text-white font-semibold px-5 py-2 rounded-xl transition-all text-sm shadow-sm"
              >
                Get a Demo
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-[#09090b] transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block h-0.5 w-6 bg-[#09090b] transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-[#09090b] transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-b border-zinc-200 px-6 py-4 flex flex-col gap-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
            >
              {link.label}
            </a>
          ))}

          {session ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-bold text-white bg-[#09090b] px-4 py-2.5 rounded-xl justify-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
                <div className="w-6 h-6 rounded-full bg-[#09090b] flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                {username}
              </div>
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/auth/login" }); }}
                className="flex items-center gap-2 text-sm font-semibold text-red-500"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-2">
                <Link
                  href="/auth/login"
                  className="flex-1 inline-flex items-center justify-center border border-zinc-300 text-zinc-700 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex-1 inline-flex items-center justify-center bg-[#09090b] text-white font-semibold px-4 py-2.5 rounded-xl transition-all text-sm"
                >
                  Sign Up
                </Link>
              </div>
              <a
                href="/#demo"
                className="inline-flex items-center justify-center bg-[#09090b] text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm w-full"
              >
                Get a Demo
              </a>
            </>
          )}
        </motion.div>
      )}
    </motion.header>
  );
}
