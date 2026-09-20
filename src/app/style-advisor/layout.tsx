import type { Metadata } from "next";
import { generateStyleAdvisorSchema } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "AI Style Advisor & Haute Couture Lookbook — CunFashion",
  description:
    "Get personalized AI outfit recommendations, discover curated luxury fashion from Amazon US / Global (cuncute-20), Rakuten designer brands, and Fourthwall CunCute boutique.",
  alternates: {
    canonical: "https://cunfashion.com/style-advisor",
  },
  openGraph: {
    title: "AI Style Advisor & Haute Couture Lookbook — CunFashion",
    description:
      "Instant visual fashion stylist powered by AI. Match dresses, blazers, and luxury outfits from Amazon US & global designers.",
    url: "https://cunfashion.com/style-advisor",
    siteName: "CunFashion",
    type: "website",
    images: [
      {
        url: "/images/brand/logo-animated.webp",
        width: 1200,
        height: 630,
        alt: "CunFashion AI Style Advisor & Luxury Fashion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Style Advisor — CunFashion & Cun Cute Store",
    description: "Get personalized AI outfit recommendations and luxury capsule lookbooks.",
    images: ["/images/brand/logo-animated.webp"],
  },
};

export default function StyleAdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = generateStyleAdvisorSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
