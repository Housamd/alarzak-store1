import "./globals.css";
import type { ReactNode, CSSProperties } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartContext";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata = {
  title: "Al-Razak Cash & Carry",
  description:
    "Wholesale & retail groceries for shops and families.",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSiteSettings();

  const bodyStyle: CSSProperties = {
    ["--brand-primary" as any]: settings.primaryColor,
    ["--brand-accent" as any]: settings.accentColor,
  };

  return (
    <html lang="en">
      <body
        className="bg-gray-50 text-gray-900 min-h-screen flex flex-col"
        style={bodyStyle}
      >
        <CartProvider>
          <Navbar
            siteName={settings.siteName}
            tagline={settings.tagline}
            logoUrl={settings.logoUrl}
          />
          <main className="flex-1">{children}</main>
          <Footer
            siteName={settings.siteName}
            tagline={settings.tagline}
          />
        </CartProvider>
      </body>
    </html>
  );
}
