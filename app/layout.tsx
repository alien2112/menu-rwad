import type { Metadata } from "next";
import "./globals.css";
import "@/lib/polyfills";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeProvider } from "@/contexts/ThemeContext";
import dbConnect from "@/lib/mongodb";
import SiteSettings from "@/lib/models/SiteSettings";
import { cairo, inter } from "./fonts";

export const metadata: Metadata = {
  title: "RWAD Menu",
  description: "تجربة قهوة استثنائية في قلب المدينة المنورة",
  manifest: "/manifest.json",
  icons: {
    icon: "/موال مراكش طواجن  1 (1).png",
    shortcut: "/موال مراكش طواجن  1 (1).png",
    apple: "/موال مراكش طواجن  1 (1).png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RWAD Menu",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "RWAD Menu",
    title: "RWAD Menu - Restaurant Management",
    description: "تجربة قهوة استثنائية في قلب المدينة المنورة",
  },
  twitter: {
    card: "summary_large_image",
    title: "RWAD Menu",
    description: "تجربة قهوة استثنائية في قلب المدينة المنورة",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#9C6B1E" },
    { media: "(prefers-color-scheme: dark)", color: "#4F3500" },
  ],
};

// Force all routes under this layout to be dynamically rendered (SSR)
export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme on the server to avoid FOUC and apply globally before paint
  let themeVars: Record<string, string> | null = null;

  // Convert HEX (#rrggbb) to H S% L% triplet string compatible with CSS variables
  const hexToHslTriplet = (hex: string): string | null => {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!parsed) return null;
    const r = parseInt(parsed[1], 16) / 255;
    const g = parseInt(parsed[2], 16) / 255;
    const b = parseInt(parsed[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0; const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const H = Math.round(h * 360);
    const S = Math.round(s * 100);
    const L = Math.round(l * 100);
    return `${H} ${S}% ${L}%`;
  };

  let initialTheme: Record<string, string> | null = null;

  try {
    await dbConnect();
    const settings = await SiteSettings.getSettings();
    const theme = (settings as any)?.theme as Record<string, string> | undefined;
    if (theme && Object.keys(theme).length > 0) {
      initialTheme = theme;
      themeVars = {};
      for (const [key, rawValue] of Object.entries(theme)) {
        if (typeof rawValue !== 'string' || !rawValue.trim()) continue;
        let value = rawValue.trim();
        if (/^#([A-Fa-f0-9]{6})$/.test(value)) {
          const converted = hexToHslTriplet(value);
          if (converted) value = converted;
        }
        themeVars[`--${key}`] = value;
      }
    }
  } catch {
    // Ignore errors and fall back to CSS defaults
  }

  const inlineThemeCss = themeVars && Object.keys(themeVars).length > 0
    ? `:root{${Object.entries(themeVars).map(([k, v]) => `${k}:${v};`).join('')}}`
    : '';

  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${cairo.variable} ${inter.variable}`}
    >
      <head>
        {/* Preconnect for MongoDB Atlas and other critical resources */}
        <link rel="dns-prefetch" href="https://cloud.mongodb.com" />

        {/* Preload critical resources */}
        <link rel="preload" as="fetch" href="/api/categories" crossOrigin="anonymous" />
        <link rel="preload" as="fetch" href="/api/items" crossOrigin="anonymous" />

        {inlineThemeCss && (
          <style
            // Apply saved theme variables before paint to prevent FOUC
            dangerouslySetInnerHTML={{ __html: inlineThemeCss }}
          />
        )}
      </head>
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              let scrollingTimer;
              const onScroll = () => {
                document.documentElement.setAttribute('data-scrolling', 'true');
                clearTimeout(scrollingTimer);
                scrollingTimer = setTimeout(() => {
                  document.documentElement.removeAttribute('data-scrolling');
                }, 250);
              };
              window.addEventListener('scroll', onScroll, { passive: true });
            })();`
          }}
        />
        <ThemeProvider initialTheme={initialTheme}>
          <LanguageProvider>
            <CartProvider>
              {children}
              <LanguageSwitcher />
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
