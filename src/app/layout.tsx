import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { PageLoadingProvider } from "@/components/PageLoadingContext";
import { seo, person } from "@/data/siteConfig";
import { GoogleAnalytics } from '@next/third-parties/google'

export const metadata: Metadata = {
  metadataBase: new URL(seo.url),

  title: {
    default: "Riasat Khan Qanony | Full Stack Developer from Kabul",
    template: "%s | Riasat Khan Qanony",
  },

  verification: {
    google:  seo.googleVerification,
  },

  description:
    "I'm Riasat Khan Qanony, a full-stack developer who builds modern web applications with Laravel, PHP, Next.js and TypeScript.",

  keywords: [
    "Riasat Khan Qanony",
    "Full Stack Developer Portfolio",
    "Next.js Developer",
    "React Developer",
    "NestJS Backend Developer",
    "TypeScript Engineer",
    "Web Application Developer",
    "MongoDB PostgreSQL Prisma",
    "API Development",
    "Software Engineer Portfolio",
  ],

  authors: [{  name: person.name }],
  creator: person.name,

  alternates: {
    canonical: seo.url,
  },

icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  openGraph: {
    title: "Riasat Khan Qanony | Full Stack Developer",
    description:
      "Here's a glimpse of what I've been working on — building web apps that don't just run fast, but hold up when things get real.",
    url: seo.url,
    siteName: seo.siteName,
    images: [
      {
        url: seo.ogImage,
        width: 1200,
        height: 630,
        alt: "Riasat Khan Qanony — Full Stack Developer",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Riasat Khan Qanony | Full Stack Developer",
    description:
      "I build web apps using React, Next.js, and TypeScript — the kind that stay fast, scale smoothly, and don't fall apart once real users show up.",
    site: seo.twitterHandle,
    images: [seo.ogImage],
  },

  applicationName: seo.siteName,
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-page text-main antialiased">

        {/* Loader safety script */}
        <Script id="loader-safety-switch" strategy="afterInteractive">
          {`
            (function() {
              const hideLoader = () => {
                const loader = document.getElementById('initial-loader');
                if (loader) loader.classList.add('loaded');
              };
              if (document.readyState === 'complete') hideLoader();
              else window.addEventListener('load', hideLoader);
              setTimeout(hideLoader, 3000);
            })();
          `}
        </Script>

        {/* Loader */}
        <div id="initial-loader">
          <div className="loader-content">
            <div className="loader-typography">
              <span className="loader-name">RIASAT KHAN QANONY</span>
              <span className="loader-year">Portfolio 2026</span>
            </div>
            <div className="loader-circle-container">
              <svg className="loader-circle-svg" viewBox="0 0 48 48">
                <circle className="circle-bg" cx="24" cy="24" r="22" />
                <circle className="circle-progress" cx="24" cy="24" r="22" />
              </svg>
            </div>
          </div>
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PageLoadingProvider>
            {children}
            <ThemeToggle />
          </PageLoadingProvider>
        </ThemeProvider>

        {/* Vercel observability — production only */}
        <Analytics mode="production" />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-42FRP71HTB" />
      </body>
    </html>
  );
}