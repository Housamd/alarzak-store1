"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed.");
      }

      // نجاح: نوجّه العميل لحسابه
      router.push("/account");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-xl shadow-sm p-6 space-y-4">
        <h1 className="text-lg font-semibold text-center">
          Create an account
        </h1>
        <p className="text-xs text-gray-500 text-center">
          Save your details and track your wholesale orders.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-3 mt-2"
        >
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Name (optional)
            </label>
            <input
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Email *
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
              Password *
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

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Confirm password *
            </label>
            <input
              type="password"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {submitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-blue-600 underline"
          >
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
