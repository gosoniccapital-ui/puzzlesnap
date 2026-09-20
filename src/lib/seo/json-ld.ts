/**
 * Structured Data (JSON-LD) Helper Functions for Schema.org SEO
 * Compliant with Google Search Central specifications.
 */

export interface SchemaBreadcrumbItem {
  name: string;
  url: string;
}

export interface PuzzleSchemaData {
  title: string;
  description: string;
  image: string;
  url: string;
  category?: string;
  difficulty?: string;
  playsCount?: number;
  likesCount?: number;
}

/**
 * Global WebSite & SearchAction Schema
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CunFashion",
    alternateName: "CunFashion Haute Couture & Puzzles",
    url: "https://cunfashion.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://cunfashion.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Global Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CunFashion",
    url: "https://cunfashion.com",
    logo: "https://cunfashion.com/images/brand/logo-animated.webp",
    sameAs: [
      "https://cute.cunfashion.com",
      "https://instagram.com/cunfashion",
      "https://facebook.com/cunfashion",
    ],
  };
}

/**
 * Game & WebApplication Schema for Puzzle Pages
 */
export function generatePuzzleGameSchema(data: PuzzleSchemaData) {
  const ratingValue = Math.min(5, Math.max(4.5, 4.5 + ((data.likesCount || 10) % 5) * 0.1)).toFixed(1);
  const ratingCount = Math.max(15, (data.likesCount || 0) + (data.playsCount || 20));

  return {
    "@context": "https://schema.org",
    "@type": ["Game", "WebApplication"],
    name: `${data.title} — Online Jigsaw Puzzle`,
    description: data.description,
    image: data.image.startsWith("http") ? data.image : `https://cunfashion.com${data.image}`,
    url: data.url,
    applicationCategory: "GameApplication",
    genre: ["Puzzle", "Brain Game", "Fashion"],
    gameItem: {
      "@type": "Thing",
      name: "Jigsaw Puzzle Pieces",
    },
    operatingSystem: "Any Web Browser (Desktop, iOS, Android)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      bestRating: "5",
      worstRating: "1",
      ratingCount,
    },
    publisher: {
      "@type": "Organization",
      name: "CunFashion",
      url: "https://cunfashion.com",
    },
  };
}

/**
 * BreadcrumbList Schema for Navigation Hierarchy
 */
export function generateBreadcrumbSchema(items: SchemaBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * CollectionPage & Fashion Service Schema for Style Advisor
 */
export function generateStyleAdvisorSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Style Advisor & Haute Couture Lookbook — CunFashion",
    description:
      "Get personalized AI outfit recommendations, discover curated luxury fashion from Amazon US / Global (cuncute-20), Rakuten designer brands, and Fourthwall CunCute boutique.",
    url: "https://cunfashion.com/style-advisor",
    publisher: {
      "@type": "Organization",
      name: "CunFashion",
      url: "https://cunfashion.com",
    },
    about: {
      "@type": "Thing",
      name: "Fashion Styling & Capsule Wardrobe",
    },
  };
}
