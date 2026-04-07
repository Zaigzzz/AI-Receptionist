import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import DevTools from "@/components/DevTools";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "ProAnswer — AI Receptionist for Home Services",
  description: "Never miss a client call again. ProAnswer answers every call 24/7 — nights, weekends, and while you're on the job. More calls answered means more jobs booked.",
  keywords: "AI receptionist, home services, plumber, electrician, HVAC, contractor, missed calls, answering service",
  openGraph: {
    title: "ProAnswer — AI Receptionist for Home Services",
    description: "Never miss a client call again. 24/7 AI answering for home service businesses.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers session={session}>{children}</Providers>
        <DevTools />
      </body>
    </html>
  );
}
