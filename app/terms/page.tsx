import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
          &larr; Back to home
        </Link>

        <h1 className="font-display text-4xl font-extrabold text-zinc-900 mt-8 mb-4 tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: April 7, 2026</p>

        <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6 text-[15px] leading-relaxed">
          <h2 className="text-xl font-bold text-zinc-900 mt-8">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ProAnswer (&quot;the Service&quot;), operated by ProAnswer (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
            you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">2. Description of Service</h2>
          <p>
            ProAnswer provides an AI-powered receptionist service for home service businesses. The Service includes
            AI call answering, call routing, a web dashboard, and related features.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">3. Accounts</h2>
          <p>
            You must provide accurate information when creating an account. You are responsible for maintaining
            the security of your account credentials and for all activity under your account.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">4. Payment & Billing</h2>
          <p>
            Paid plans are billed on a recurring monthly basis. You authorize us to charge your payment method
            on file. You may cancel your subscription at any time through your dashboard or by contacting us.
            Cancellations take effect at the end of the current billing period.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the operation of the Service</li>
            <li>Resell or redistribute the Service without permission</li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">6. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. We are not liable for any
            indirect, incidental, or consequential damages arising from your use of the Service. Our total
            liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">7. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time for violation of these terms.
            You may terminate your account at any time by contacting us.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">8. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. We will notify you of material changes via email
            or through the Service. Continued use after changes constitutes acceptance.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">9. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:nicholasfioren2820@gmail.com" className="text-zinc-900 font-semibold hover:underline">
              nicholasfioren2820@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
