import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { Toaster } from "react-hot-toast";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "EESA - Electrical and Electronics Students Association",
  description:
    "Platform for EESA students, teachers, and alumni to share notes, projects, events, and career opportunities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} font-sans antialiased`}
      >
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
