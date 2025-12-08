// components/auth/AuthStatus.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";

type MeResponse = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function AuthStatus() {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<MeResponse | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/account/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          if (!cancelled) {
            setCustomer(null);
          }
          return;
        }

        const data = await res.json();
        if (!cancelled) {
          setCustomer({
            id: data.id,
            name: data.name,
            email: data.email,
          });
        }
      } catch {
        if (!cancelled) {
          setCustomer(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [pathname]); // ⬅ كل ما تغيرت الصفحة، نعيد الفحص

  if (loading) {
    return (
      <span className="text-[11px] text-gray-400">
        …
      </span>
    );
  }

  if (!customer) {
    // غير مسجّل دخول
    return (
      <div className="flex items-center gap-3 text-xs">
        <Link
          href="/auth/login"
          className="px-3 py-1 border rounded hover:bg-gray-50"
        >
          Sign in
        </Link>
        <Link
          href="/auth/register"
          className="px-3 py-1 border rounded bg-black text-white hover:bg-gray-900"
        >
          Register
        </Link>
      </div>
    );
  }

  const label = customer.name || customer.email || "";

  // مسجّل دخول
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="hidden sm:inline text-gray-600">
        Logged in as{" "}
        <Link
          href="/account"
          className="font-semibold hover:underline"
        >
          {label}
        </Link>
      </span>
      <Link
        href="/account"
        className="sm:hidden px-3 py-1 border rounded hover:bg-gray-50"
      >
        Account
      </Link>
      <LogoutButton />
    </div>
  );
}
