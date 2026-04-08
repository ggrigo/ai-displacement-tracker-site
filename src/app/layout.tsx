import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Displacement Tracker",
  description:
    "Tracking reported deaths linked to AI-driven economic displacement. Nobody else is counting.",
  openGraph: {
    title: "AI Displacement Tracker",
    description:
      "Tracking reported deaths linked to AI-driven economic displacement.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
