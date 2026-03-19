import type { Metadata } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "CS Skill Decay Index",
  description:
    "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
  metadataBase: new URL("https://csdecay.ashish.ch"),
  openGraph: {
    title: "CS Skill Decay Index",
    description:
      "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
    type: "website",
    images: [{ url: "/api/og?score=4.2&level=mid&r=0", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CS Skill Decay Index",
    description:
      "7 real-world CS scenarios. Zero AI assistance. Find out how much muscle memory you've lost since you started letting copilots think for you.",
    images: ["/api/og?score=4.2&level=mid&r=0"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jetbrains.variable} ${poppins.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased">{children}</body>
    </html>
  );
}
