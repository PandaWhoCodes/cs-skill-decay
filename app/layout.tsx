import type { Metadata } from "next";
import { JetBrains_Mono, Outfit, Syne } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });

export const metadata: Metadata = {
  title: "CS Skill Decay Index",
  description:
    "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
  openGraph: {
    title: "CS Skill Decay Index",
    description:
      "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CS Skill Decay Index",
    description:
      "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jetbrains.variable} ${outfit.variable} ${syne.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased">{children}</body>
    </html>
  );
}
