import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import { AuthProvider } from "./_providers/AuthProvider";
import { ToastProvider } from "./_providers/ToastProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Outzidr Commerce - Multi-tenant E-commerce Platform",
  description: "Production-grade e-commerce platform with dynamic pricing and multi-tenancy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${montserrat.variable} font-sans antialiased`}
        style={{ backgroundColor: colors.bg.primary, fontFamily: 'var(--font-montserrat)' }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <ToastProvider>
            <Navigation />
            <main className="min-h-screen pt-16">
              {children}
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
