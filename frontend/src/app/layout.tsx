import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Propagation Predictor — Hate Speech & Cascade Dynamics",
  description: "Evidence-based source verification, content categorization, and cascade propagation forecasting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-amber-500/20 selection:text-amber-900 bg-[#faf7f2] text-stone-900">
        {children}
      </body>
    </html>
  );
}
