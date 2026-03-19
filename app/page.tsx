import { Metadata } from "next";
import DecayIndex from "@/components/DecayIndex";

interface Props {
  searchParams: Promise<{ s?: string; l?: string; r?: string }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://csdecay.ashish.ch";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  if (params.s && params.l) {
    const ogUrl = `${BASE_URL}/api/og?score=${params.s}&level=${params.l}${params.r ? `&r=${params.r}` : ""}`;
    return {
      openGraph: {
        images: [{ url: ogUrl, width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        images: [ogUrl],
      },
    };
  }
  return {};
}

export default function Home() {
  return <DecayIndex />;
}
