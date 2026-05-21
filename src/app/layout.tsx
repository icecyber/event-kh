import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/Provider";
import { LangProvider } from "@/components/LangProvider";
import NavBar from "@/components/NavBar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EventKH — Event Management Platform",
  description:
    "Create custom registration forms, manage attendees, and issue QR code tickets for your events seamlessly.",
  keywords: ["events", "registration", "QR code", "badge", "Cambodia"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <LangProvider>
            <NavBar />
            {children}
          </LangProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
