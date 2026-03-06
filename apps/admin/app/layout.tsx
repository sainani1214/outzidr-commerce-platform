import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Outzidr Admin Panel",
  description: "Multi-tenant e-commerce platform administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
