import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap", // Optimize font loading
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export const metadata: Metadata = {
  title: "EESA - Electrical and Electronics Students Association",
  description:
    "Platform for EESA students and teachers to share notes, projects, events, and career opportunities",
  keywords:
    "EESA, electrical engineering, electronics, students, association, notes, projects, careers",
  authors: [{ name: "EESA Team" }],
  robots: "index, follow",
  metadataBase: new URL("https://eesacusat.in"),
  openGraph: {
    title: "EESA - Electrical and Electronics Students Association",
    description:
      "Platform for EESA students and teachers to share notes, projects, events, and career opportunities",
    url: "https://eesacusat.in",
    siteName: "EESA CUSAT",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/eesa-logo.svg",
        width: 800,
        height: 600,
        alt: "EESA Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EESA - Electrical and Electronics Students Association",
    description:
      "Platform for EESA students and teachers to share notes, projects, events, and career opportunities",
    images: ["/eesa-logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="https://ui-avatars.com" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Service Worker Registration */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator && window.location.hostname === 'eesacusat.in') {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(() => {
                    // Service worker registered successfully
                  })
                  .catch((error) => {
                    console.error('SW registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </head>
      <body 
        className={`${spaceGrotesk.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
          }}
        />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
