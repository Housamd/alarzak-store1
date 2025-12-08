"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          "Login failed. Please check your details.";
        setError(msg);
        setLoading(false);
        return;
      }

      // نجاح: الـ API بيضبط الكوكي customer_session
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>

      {error && (
        <p className="mb-3 text-xs text-red-600">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 text-sm"
      >
        <div className="space-y-1">
          <label className="block text-xs">Email</label>
          <input
            type="email"
            className="w-full border rounded px-2 py-1 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs">Password</label>
          <input
            type="password"
            className="w-full border rounded px-2 py-1 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/register"
          className="text-blue-600 underline"
        >
          Create one
        </Link>
      </p>
    </main>
  );
}
