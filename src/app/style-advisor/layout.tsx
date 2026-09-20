import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Style Advisor — CunFashion & Cun Cute Store",
  description: "Get personalized AI outfit recommendations, discover curated luxury fashion from Amazon US / Global (cuncute-20), Rakuten designer brands, and Fourthwall CunCute boutique.",
};

export default function StyleAdvisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
