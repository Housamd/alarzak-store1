// app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const from = searchParams.get("from") || "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(
          data?.error || "Invalid admin password."
        );
        setLoading(false);
        return;
      }

      // نجاح → نعيد التوجيه إلى /admin أو المسار الأصلي
      router.push(from);
      router.refresh();
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm border rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-2">
          Admin sign in
        </h1>
        <p className="text-xs text-gray-500 mb-4">
          This area is restricted to Al-Razak management.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >
          <div className="space-y-1 text-sm">
            <label className="block">
              Admin password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full border rounded px-2 py-1.5 text-sm"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full mt-2 px-3 py-2 rounded bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
