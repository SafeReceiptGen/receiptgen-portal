import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://getsafereceipts.com"), // Update with your domain
  title: {
    default:
      "SafeReceipts - Digital Receipts & Returns Management for Retailers",
    template: "%s | SafeReceipts",
  },
  description:
    "Replace paper receipts with secure, verifiable digital proof of purchase and streamline returns management for retailers. Prevent fraud, speed up refunds, and gain insights.",
  keywords: [
    "safe receipts",
    "getsafereceipts",
    "digital receipts",
    "returns management software",
    "retail returns solution",
    "prevent return fraud",
    "digital proof of purchase",
    "receipt generator app",
    "e-receipt system",
    "Ghana retail software",
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
    url: "https://getsafereceipts.com",
    title: "SafeReceipts - Digital Receipts & Returns Management for Retailers",
    description:
      "Replace paper receipts with secure, verifiable digital proof of purchase and streamline returns management for retailers.",
    siteName: "SafeReceipts",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SafeReceipts - Digital Receipts & Returns Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeReceipts - Digital Receipts & Returns Management",
    description:
      "Replace paper receipts with secure digital proof of purchase and streamline returns management.",
    creator: "@safereceipts", // Update with our Twitter handle
    images: ["/og-image.png"], //
  },
  verification: {
    google: "your-google-verification-code", // Add after Google Search Console setup
  },
  alternates: {
    canonical: "https://getsafereceipts.com",
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
        {gaMeasurementId ? (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-gtag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}');
              `}
            </Script>
          </>
        ) : null}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased bg-slate-50 dark:bg-[#0A0F1C]">
        <QueryProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </QueryProvider>
      </body>
    </html>
  );
}
