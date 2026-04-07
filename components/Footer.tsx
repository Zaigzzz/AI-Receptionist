export default function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                  <rect x="0" y="8" width="2.5" height="4" rx="0.5" fill="#09090b" />
                  <rect x="3.75" y="5" width="2.5" height="7" rx="0.5" fill="#09090b" />
                  <rect x="7.5" y="2" width="2.5" height="10" rx="0.5" fill="#09090b" />
                  <rect x="11.25" y="0" width="2.5" height="12" rx="0.5" fill="#09090b" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                ProAnswer
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-6">
              Your AI receptionist, always on. Never miss a client call again — 24/7, nights, weekends, and holidays.
            </p>
            <a
              href="mailto:nicholasfioren2820@gmail.com"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              Email Us
            </a>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "Contact", href: "mailto:nicholasfioren2820@gmail.com" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-zinc-500 hover:text-white text-sm transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-4">
              About the Founder
            </h4>
            <p className="text-zinc-500 text-sm leading-relaxed">
              ProAnswer was built out of a simple frustration: hardworking tradespeople losing jobs just because they couldn&apos;t answer their phones on a busy day. We built the solution we wished existed — focused, founder-led, and committed to one thing: making sure you never miss a job again.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} ProAnswer. All rights reserved.
          </p>
          <p className="text-zinc-600 text-sm">
            Built for home service businesses that refuse to miss a call.
          </p>
        </div>
      </div>
    </footer>
  );
}
