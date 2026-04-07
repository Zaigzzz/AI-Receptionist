import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
          &larr; Back to home
        </Link>

        <h1 className="font-display text-4xl font-extrabold text-zinc-900 mt-8 mb-4 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-zinc-400 mb-10">Last updated: April 7, 2026</p>

        <div className="prose prose-zinc max-w-none text-zinc-600 space-y-6 text-[15px] leading-relaxed">
          <h2 className="text-xl font-bold text-zinc-900 mt-8">1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Account information:</strong> name, email address, business name, and password (hashed)</li>
            <li><strong>Business profile:</strong> business type, location, hours, services, and AI configuration preferences</li>
            <li><strong>Call data:</strong> call transcripts, duration, and metadata processed through our AI receptionist</li>
            <li><strong>Payment information:</strong> processed securely through Stripe; we do not store card numbers</li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and operate the AI receptionist service</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send service-related communications</li>
            <li>Improve our service and develop new features</li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">3. Data Sharing</h2>
          <p>
            We do not sell your personal information. We share data only with service providers necessary
            to operate ProAnswer:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Vapi:</strong> for AI voice call processing</li>
            <li><strong>Stripe:</strong> for payment processing</li>
            <li><strong>Resend:</strong> for transactional emails</li>
            <li><strong>Neon:</strong> for database hosting</li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">4. Data Security</h2>
          <p>
            We use industry-standard security measures including encrypted connections (HTTPS),
            hashed passwords, and secure third-party providers. However, no method of transmission
            over the Internet is 100% secure.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">5. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. You may request deletion
            of your account and associated data by contacting us.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
          </ul>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We do not use
            tracking or advertising cookies.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">8. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of material changes
            via email or through the Service.
          </p>

          <h2 className="text-xl font-bold text-zinc-900 mt-8">9. Contact</h2>
          <p>
            For privacy-related questions, contact us at{" "}
            <a href="mailto:nicholasfioren2820@gmail.com" className="text-zinc-900 font-semibold hover:underline">
              nicholasfioren2820@gmail.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
