import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
import { AuthProvider } from "./_providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
        className={`${inter.variable} font-sans antialiased`}
        style={{ backgroundColor: colors.bg.primary }}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen pt-16">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
