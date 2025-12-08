// components/admin/OrderStatusForm.tsx
"use client";

import { useState } from "react";

const STATUSES = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
] as const;

export default function OrderStatusForm({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus || "NEW");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update status");
      }

      setMessage("Status updated.");
    } catch (err: any) {
      setMessage(err.message || "Error updating status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-2 py-1 text-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="px-3 py-1 rounded bg-black text-white text-xs disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {message && (
        <p className="text-[11px] text-gray-600">
          {message}
        </p>
      )}
    </div>
  );
}
