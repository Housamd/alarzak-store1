"use client";

import { useState } from "react";

type Props = {
  initialName: string;
  email: string | null;
  customerType: string;
};

export default function AccountProfileForm({
  initialName,
  email,
  customerType,
}: Props) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/account/profile", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to update.");
      }

      setMessage("Details updated successfully.");
    } catch (err: any) {
      setError(
        err?.message || "Could not update details."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 text-sm"
    >
      <div className="space-y-1">
        <label className="text-xs text-gray-600">
          Full name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border rounded px-2 py-1.5"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-600">
          Email (not editable)
        </label>
        <input
          type="text"
          value={email || ""}
          disabled
          className="w-full border rounded px-2 py-1.5 bg-gray-50 text-gray-500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-gray-600">
          Customer type
        </label>
        <input
          type="text"
          value={
            customerType === "WHOLESALE"
              ? "Wholesale / trade"
              : "Retail"
          }
          disabled
          className="w-full border rounded px-2 py-1.5 bg-gray-50 text-gray-500"
        />
      </div>

      {message && (
        <p className="text-[11px] text-green-600">
          {message}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="mt-1 px-4 py-2 rounded bg-black text-white text-xs font-medium hover:bg-gray-900 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
