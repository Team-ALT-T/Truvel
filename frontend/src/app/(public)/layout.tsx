import type { Metadata } from "next";

import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";

import "./public.css";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: siteName,
  title: siteTitle,
  description: siteDescription,
  keywords: ["여행 계획", "여행 일정", "경로 최적화", "여행 동선", "Truvel"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
