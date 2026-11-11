import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant-garamond",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Bags & Accessories`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Discover Youniq bags and Youniqlyf accessories, designed to bring style and function to every day.",
  icons: { icon: "/logo.svg" },
  openGraph: { siteName: SITE_NAME, type: "website" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${plusJakartaSans.variable} ${cormorantGaramond.variable}`}
    >
      <body className={`flex min-h-full flex-col ${plusJakartaSans.className}`}>
        {children}
      </body>
    </html>
  );
}
