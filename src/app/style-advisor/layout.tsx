import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Style Advisor — CunFashion & Cun Cute Store",
  description: "Get personalized AI outfit recommendations, discover curated fashion from Fourthwall cute merch, Rakuten brands, Amazon US, and Shopee/TikTok.",
};

export default function StyleAdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
