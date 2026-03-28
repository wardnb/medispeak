import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediSpeak — Medical Spanish Practice",
  description:
    "Practice conversational medical Spanish through realistic patient role-play with AI coaching.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#f8fffe]">{children}</body>
    </html>
  );
}
