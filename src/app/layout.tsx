import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SimulatorEngine from "@/components/SimulatorEngine";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eco-Sync AI — Smart Home Energy Dashboard",
  description:
    "AI-powered smart home energy management platform. Monitor, optimize, and save on your home energy consumption in real-time.",
  keywords: ["smart home", "energy", "AI", "IoT", "eco", "dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-[var(--color-text-primary)]">
        <div className="flex min-h-screen">
          <SimulatorEngine />
          <Sidebar />
          <main className="flex-1 ml-[72px] lg:ml-[240px] p-4 lg:p-6 transition-all duration-300">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
