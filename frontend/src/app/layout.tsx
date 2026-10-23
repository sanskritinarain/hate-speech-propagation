import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hate Speech Propagation Prediction System",
  description: "Proactive prediction of online hate speech intensity and conversation cascade dynamics using early activity signals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
