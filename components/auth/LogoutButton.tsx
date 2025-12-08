// components/auth/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-1 border rounded text-xs hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Signing out..." : "Logout"}
    </button>
  );
}
