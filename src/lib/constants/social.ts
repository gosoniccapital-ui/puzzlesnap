export interface SocialLinkItem {
  name: string;
  url: string;
  icon: "facebook" | "youtube" | "tiktok" | "x";
  label: string;
  badge?: string;
}

export const CUNFASHION_SOCIAL_CHANNELS: SocialLinkItem[] = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/www.MuaChung.co/",
    icon: "facebook",
    label: "Follow CunFashion on Facebook",
    badge: "Community",
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/@cunfashion",
    icon: "youtube",
    label: "Subscribe to CunFashion YouTube Channel",
    badge: "Official Videos",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@muachung.co",
    icon: "tiktok",
    label: "Follow CunFashion TikTok",
    badge: "Trending Looks",
  },
  {
    name: "X",
    url: "https://x.com/cunfashion",
    icon: "x",
    label: "Follow CunFashion on X",
    badge: "Latest Updates",
  },
];
