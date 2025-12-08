"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type NavbarProps = {
  siteName?: string;
  tagline?: string;
  logoUrl?: string | null;
};

export default function Navbar({
  siteName = "Al-Razak Cash & Carry",
  tagline = "The best place to stock your shop or your home.",
  logoUrl = null,
}: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLogged, setIsLogged] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/account/me", {
          cache: "no-store",
        });
        if (!cancelled) {
          setIsLogged(res.ok);
        }
      } catch {
        if (!cancelled) setIsLogged(false);
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href
      ? "text-white font-semibold"
      : "text-gray-200 hover:text-white";

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // نتجاهل
    } finally {
      setIsLogged(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <header
      className="border-b"
      style={{
        backgroundColor: "var(--brand-primary)",
      }}
    >
      {/* ارتفاع أكبر للبنر العلوي */}
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* شعار + اسم الموقع */}
        <div className="flex items-center gap-4">
          {/* اللوغو أكبر وفي منتصف الارتفاع */}
          {logoUrl ? (
            <div className="relative w-16 h-16 bg-white rounded-full overflow-hidden flex items-center justify-center">
              <Image
                src={logoUrl}
                alt={siteName}
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold">
              AR
            </div>
          )}

          <div className="flex flex-col justify-center">
            {/* اسم الشركة أكبر */}
            <Link
              href="/"
              className="text-lg md:text-xl font-semibold text-white leading-tight"
            >
              {siteName}
            </Link>
            <span className="text-[11px] text-gray-300">
              {tagline}
            </span>
          </div>
        </div>

        {/* الروابط اليمنى */}
        <nav className="flex items-center gap-4 text-xs">
          <Link
            href="/products"
            className={isActive("/products")}
          >
            Products
          </Link>
          <Link href="/cart" className={isActive("/cart")}>
            Basket
          </Link>
          <Link
            href="/admin"
            className="text-gray-300 hover:text-white"
          >
            Admin
          </Link>

          {!checkingAuth && (
            <>
              {isLogged ? (
                <>
                  <Link
                    href="/account/profile"
                    className="px-3 py-1 rounded-full text-[11px]"
                    style={{
                      backgroundColor: "var(--brand-accent)",
                      color: "#ffffff",
                    }}
                  >
                    My account
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1 rounded-full border text-gray-200 hover:bg-white hover:text-gray-900"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-3 py-1 rounded-full border text-gray-200 hover:bg-white hover:text-gray-900"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
