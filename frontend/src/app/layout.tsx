import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin-ext"], // Enforces Turkish character support
  preload: false,
});

export const metadata: Metadata = {
  title: "Kütüphane Yönetim Sistemi",
  description: "Premium Bookstore Management Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-zinc-100">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
