import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/latin-600.css";
import "./globals.css";

const isIndexable = process.env.PROMO_PREMIUM_INDEXABLE === "true";
const configuredSite = process.env.PROMO_PREMIUM_SITE_URL;
// The fallback is local-only because indexing remains disabled without an
// explicit commercial launch configuration.
const metadataBase = new URL(configuredSite || "http://localhost:3100");

export const metadata: Metadata = {
  title: "Promo Brindes Premium | Presentes que deixam uma marca",
  description:
    "Uma curadoria de presentes corporativos, kits e brindes personalizados. Encontre a peça certa e prepare um projeto com a essência da sua marca.",
  metadataBase,
  alternates: { canonical: "/" },
  robots: isIndexable
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    title: "Promo Brindes Premium — A arte de presentear",
    description: "Presentes extraordinários para relações que importam.",
    locale: "pt_BR",
    type: "website",
    images: ["/images/hero-gifting.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
