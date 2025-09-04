import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

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
    "Platform for EESA students, teachers, and alumni to share notes, projects, events, and career opportunities",
  keywords: "EESA, electrical engineering, electronics, students, association, notes, projects, careers",
  authors: [{ name: "EESA Team" }],
  robots: "index, follow",
  metadataBase: new URL("https://eesacusat.in"),
  openGraph: {
    title: "EESA - Electrical and Electronics Students Association",
    description: "Platform for EESA students, teachers, and alumni to share notes, projects, events, and career opportunities",
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
    description: "Platform for EESA students, teachers, and alumni to share notes, projects, events, and career opportunities",
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="https://ui-avatars.com" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/eesa-logo.svg" />
        
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
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `}
        </Script>
      </head>
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
