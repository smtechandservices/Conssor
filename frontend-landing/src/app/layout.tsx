import type { Metadata } from "next";
import { Noto_Serif, Montserrat } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CONSSOR | Strategic Intelligence & Collaborative Advisory",
  description: "Connect with world-class domain experts through CONSSOR, the premium consulting marketplace powered by AI engagement pricing.",
  icons: {
    icon: "/assets/logo-bird.png",
    shortcut: "/assets/logo-bird.png",
    apple: "/assets/logo-bird.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${montserrat.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/30">{children}</body>
    </html>
  );
}
