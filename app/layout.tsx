import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/landing/v2/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://safereceipts.com"), // Update with your domain
  title: {
    default: "SafeReceipts - Professional Receipt Generator with QR Codes",
    template: "%s | SafeReceipts",
  },
  description:
    "Generate professional digital receipts in seconds with QR codes, PDF export and live preview. Perfect for freelancers, small businesses and event organizers. Free to start.",
  keywords: [
    "receipt generator",
    "digital receipt",
    "QR code receipt",
    "PDF receipt",
    "online receipt maker",
    "receipt template",
    "business receipt",
    "invoice generator",
    "free receipt generator",
  ],
  authors: [{ name: "SafeReceipts Team" }],
  creator: "SafeReceipts",
  publisher: "SafeReceipts",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://safereceipts.com",
    title: "SafeReceipts - Professional Receipt Generator with QR Codes",
    description:
      "Generate professional digital receipts in seconds with QR codes, PDF export and live preview. Free to start.",
    siteName: "SafeReceipts",
    images: [
      {
        url: "/og-image.jpg", // Create this image (1200x630px)
        width: 1200,
        height: 630,
        alt: "SafeReceipts - Professional Receipt Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeReceipts - Professional Receipt Generator",
    description:
      "Generate professional digital receipts in seconds with QR codes and PDF export.",
    creator: "@safereceipts", // Update with your Twitter handle
    images: ["/twitter-image.jpg"], // Create this image (1200x600px)
  },
  verification: {
    google: "your-google-verification-code", // Add after Google Search Console setup
  },
  alternates: {
    canonical: "https://SafeReceipts.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
