import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Inter } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

const inter = Inter({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KaloPay",
  description: "KaloPay - Multi-role payroll management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
