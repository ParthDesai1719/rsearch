import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileHeader } from "@/components/ui/mobile-header";
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from "@/components/ui/toaster";
const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "rSearch: AI-Powered Reasoning Engine",
  description: "A cutting-edge reasoning engine powered by artificial intelligence that harnesses advanced reasoning capabilities combined with comprehensive internet search functionality.",
  applicationName: "rSearch",
  authors: [{ name: "Malhar Ujawane", url: "https://twitter.com/justmalhar" }],
  keywords: ["rsearch", "deepseek", "reasoning engine", "AI search", "semantic search", "research assistant", "AI powered search", "deepseek coder", "deepseek chat", "deepseek coder 2", "deepseek chat 2"],
  creator: "Malhar Ujawane",
  publisher: "rSearch",
  metadataBase: new URL('https://rsearch.app'),
  alternates: {
    canonical: 'https://rsearch.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "rSearch: AI-Powered Reasoning Engine",
    description: "Discover Insights, Not Just Results. AI-powered reasoning engine that thinks just like you do.",
    url: 'https://rsearch.app',
    siteName: 'rSearch',
    images: [
      {
        url: 'https://rsearch.app/og.png', // Using absolute URL
        width: 1200,
        height: 630,
        alt: 'rSearch - AI-Powered Research Assistant'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'rSearch: AI-Powered Research Assistant',
    description: 'Discover Insights, Not Just Results. AI-powered reasoning engine that thinks just like you do.',
    creator: '@justmalhar',
    site: '@justmalhar',
    images: ['https://rsearch.app/og.png'], // Using absolute URL
  },
  icons: {
    icon: {
      url: `data:image/svg+xml,${encodeURIComponent(`<svg width="32" height="32" viewBox="0 0 52 55" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23.0344 0.5H29.6344C32.1544 0.5 33.1144 1.34 32.8744 3.62L31.5544 17.42C31.4344 18.26 31.9144 18.5 32.5144 17.9L43.5544 9.98C45.8344 8.66 46.7944 8.78 47.9944 11.18L51.2344 16.7C52.5544 18.86 52.1944 20.18 49.9144 21.14L37.1944 27.02C36.7144 27.38 36.7144 27.74 37.1944 27.98L49.9144 33.74C52.1944 34.82 52.5544 36.02 51.1144 38.06L47.9944 43.7C46.7944 45.74 45.5944 46.22 43.5544 44.9L32.5144 36.62C32.0344 36.14 31.4344 36.5 31.5544 37.22L32.6344 51.38C32.8744 53.78 32.0344 54.5 29.6344 54.5H23.0344C20.6344 54.5 19.7944 53.78 19.9144 51.38L21.2344 37.22C21.3544 36.5 20.8744 36.14 20.2744 36.62L8.99436 44.9C7.07436 46.22 5.87436 45.74 4.67436 43.7L1.55436 38.06C0.23436 36.02 0.35436 34.82 2.75436 33.74L15.5944 27.98C16.0744 27.74 16.0744 27.38 15.5944 27.02L2.63436 21.14C0.59436 20.18 0.23436 18.86 1.55436 16.7L4.67436 11.18C5.87436 8.78 7.07436 8.66 8.99436 9.98L20.2744 17.9C20.8744 18.5 21.3544 18.26 21.2344 17.42L19.9144 3.62C19.6744 1.34 20.6344 0.5 23.0344 0.5Z" fill="#EA580C"/></svg>`)}`,
      type: "image/svg+xml"
    },
    shortcut: '/favicon.ico',
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180'
      },
      {
        url: '/apple-touch-icon-57x57.png',
        sizes: '57x57'
      },
      {
        url: '/apple-touch-icon-72x72.png',
        sizes: '72x72'
      },
      {
        url: '/apple-touch-icon-76x76.png',
        sizes: '76x76'
      },
      {
        url: '/apple-touch-icon-114x114.png',
        sizes: '114x114'
      },
      {
        url: '/apple-touch-icon-120x120.png',
        sizes: '120x120'
      },
      {
        url: '/apple-touch-icon-144x144.png',
        sizes: '144x144'
      },
      {
        url: '/apple-touch-icon-152x152.png',
        sizes: '152x152'
      },
      {
        url: '/apple-touch-icon-180x180.png',
        sizes: '180x180'
      }
    ],
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <div className="min-h-screen bg-white flex">
          <Sidebar />
          <div className="flex-1 lg:ml-24 flex flex-col">
            <MobileHeader />
            <div className="mt-16 lg:mt-0 flex-1">
              {children}
            </div>
          </div>
        </div>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
