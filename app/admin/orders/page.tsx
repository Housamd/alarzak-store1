"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";

type DeliveryMethod = "SHIP" | "PICKUP";

type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  total: number;
  customerName: string | null;
  customerType: string | null;
  city: string | null;
  street: string | null;
  postcode: string | null;
  phone: string | null;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        const res = await fetch("/api/admin/orders", {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to load orders");
        }
        const data = await res.json();
        if (!cancelled) {
          setOrders(data || []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load orders.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  function statusColor(status: OrderStatus) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "DISPATCHED":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-300";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  }

  function deliveryLabel(method: DeliveryMethod) {
    return method === "PICKUP" ? "Pickup" : "Delivery";
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setSavingId(orderId);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error();
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update order status.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-8 px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
        <Link
          href="/admin"
          className="text-xs text-blue-600 hover:underline"
        >
          Back to admin
        </Link>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders yet.</p>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b text-[11px] text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Customer</th>
                <th className="px-3 py-2 text-left">Address</th>
                <th className="px-3 py-2 text-left">Delivery</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const created = new Date(order.createdAt);
                const dateStr =
                  created.toLocaleDateString() +
                  " " +
                  created.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                const addrParts: string[] = [];
                if (order.street) addrParts.push(order.street);
                if (order.city) addrParts.push(order.city);
                if (order.postcode) addrParts.push(order.postcode);
                const address = addrParts.join(", ") || "-";

                return (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-3 py-2 align-top">
                      <span className="font-mono text-[11px]">
                        {order.id.slice(0, 8)}
                      </span>
                      {order.customerType && (
                        <div className="text-[10px] text-gray-500">
                          Type: {order.customerType}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">{dateStr}</td>
                    <td className="px-3 py-2 align-top">
                      {order.customerName || "Customer"}
                      {order.phone && (
                        <div className="text-[10px] text-gray-500">
                          {order.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">{address}</td>
                    <td className="px-3 py-2 align-top">
                      {deliveryLabel(order.deliveryMethod)}
                    </td>
                    <td className="px-3 py-2 align-top text-right">
                      £{Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${statusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col items-end gap-1">
                        {/* تغيير الحالة */}
                        <select
                          className="border rounded px-1.5 py-1 text-[10px]"
                          value={order.status}
                          disabled={savingId === order.id}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as OrderStatus
                            )
                          }
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>

                        {/* رابط فتح / طباعة PDF */}
                        <a
  href={`/orders/${order.id}`}
  target="_blank"
  rel="noopener noreferrer"
  className="text-[10px] text-blue-600 hover:underline"
>
  View / Print invoice
</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
