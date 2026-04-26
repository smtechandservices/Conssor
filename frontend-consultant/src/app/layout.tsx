import type { Metadata } from "next";
import { Noto_Serif, Montserrat, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Consultant Portal | CONSSOR Advisory",
  description: "Vetted expert dashboard to manage engagements, leads, and earnings on the CONSSOR platform.",
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
      className={cn("h-full", "antialiased", "dark", notoSerif.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/30">
        {children}
      </body>
    </html>
  );
}
