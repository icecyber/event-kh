import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/Provider";
import { LangProvider } from "@/components/LangProvider";
import NavBar from "@/components/NavBar";

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
    <html lang="en" suppressHydrationWarning>
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
