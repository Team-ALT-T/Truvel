import type { Metadata } from "next";

import StyledComponentsRegistry from "@/lib/StyledComponentsRegistry";
import QueryProvider from "@/providers/QueryProvider";
import GlobalStyleWrapper from "@/styles/GlobalStyleWrapper";

export const metadata: Metadata = {
  title: "Truvel",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
};

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StyledComponentsRegistry>
      <QueryProvider>
        <GlobalStyleWrapper />
        {children}
      </QueryProvider>
    </StyledComponentsRegistry>
  );
}
