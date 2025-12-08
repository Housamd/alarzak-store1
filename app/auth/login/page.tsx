"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get("next") || "/account";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed.");
      }

      router.push(next);
    } catch (err: any) {
      setError(err.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <h1 className="text-lg font-semibold text-center">
          Sign in
        </h1>
        <p className="text-xs text-gray-500 text-center">
          Access your saved details and track your orders.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 mt-2"
        >
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />
          </div>

          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-3 py-2 rounded bg-black text-white text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center">
          Don&apos;t have an account?{" "}
          <a
            href="/auth/register"
            className="text-blue-600 underline"
          >
            Create one
          </a>
        </p>
      </div>
    </main>
  );
}
