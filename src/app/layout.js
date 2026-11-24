
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";

import Navbar from "@/component/layout/navbar";
import StoreSync from "@/component/StoreSync";
import ShoppingAssistant from "@/features/assistant/components/ShoppingAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ShopSphere AI",
  description: "Personalized Shopping, Powered by Intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense
          fallback={
            <div className="h-16 bg-white border-b" />
          }
        >
          <Navbar />
        </Suspense>

        {children}

        <StoreSync />
        <ShoppingAssistant />
      </body>
    </html>
  );
}
