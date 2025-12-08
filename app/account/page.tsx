"use client";

import { useEffect, useState, FormEvent } from "react";

type LastOrderInfo = {
  customerName?: string | null;
  businessName?: string | null;
  street?: string | null;
  city?: string | null;
  postcode?: string | null;
  phone?: string | null;
};

type MeResponse = {
  id: string;
  name: string | null;
  email: string | null;
  lastOrder?: LastOrderInfo;
};

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DISPATCHED"
  | "COMPLETED"
  | "CANCELLED";

type DeliveryMethod = "SHIP" | "PICKUP";

type AccountOrder = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  total: number;
  deliveryMethod: DeliveryMethod;
  city: string | null;
  postcode: string | null;
};

export default function AccountPage() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [lastOrderInfo, setLastOrderInfo] =
    useState<LastOrderInfo | null>(null);

  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(
    null
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(
    null
  );
  const [saveSuccess, setSaveSuccess] = useState<
    string | null
  >(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        // 1) بيانات الحساب الأساسية + آخر عنوان شحن
        const meRes = await fetch("/api/account/me", {
          method: "GET",
          credentials: "include",
        });

        if (meRes.status === 401) {
          if (!cancelled) {
            setAuthError("You need to sign in to view this page.");
            setInitialLoading(false);
          }
          return;
        }

        if (!meRes.ok) {
          throw new Error("Failed to load account");
        }

        const meData: MeResponse = await meRes.json();
        if (cancelled) return;

        setName(meData.name || "");
        setEmail(meData.email || "");
        if (meData.lastOrder) {
          setLastOrderInfo(meData.lastOrder);
        }

        // 2) سجل الطلبات
        try {
          const ordersRes = await fetch(
            "/api/account/orders",
            {
              method: "GET",
              credentials: "include",
            }
          );

          if (ordersRes.ok) {
            const ordersData: AccountOrder[] =
              await ordersRes.json();
            if (!cancelled) {
              setOrders(ordersData || []);
            }
          } else if (ordersRes.status !== 401) {
            // لو 401، نفس مشكلة عدم تسجيل الدخول
            if (!cancelled) {
              setOrdersError("Failed to load your orders.");
            }
          }
        } catch (err) {
          console.error(err);
          if (!cancelled) {
            setOrdersError("Failed to load your orders.");
          }
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAuthError("Failed to load your account.");
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (!name.trim() && !email.trim()) {
      setSaveError("Please fill at least one field.");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "Failed to update your account."
        );
      }

      setSaveSuccess("Your details have been updated.");
    } catch (err: any) {
      setSaveError(
        err?.message || "Failed to update your account."
      );
    } finally {
      setSaving(false);
    }
  }

  const formatMoney = (val: any) =>
    `£${Number(val || 0).toFixed(2)}`;

  if (initialLoading) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-4">
          My account
        </h1>
        <p className="text-sm text-gray-500">
          Loading your details...
        </p>
      </main>
    );
  }

  if (authError) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-4">
          My account
        </h1>
        <p className="text-sm text-red-600">
          {authError}
        </p>
      </main>
    );
  }

  const last = lastOrderInfo;
  const lastAddressParts: string[] = [];
  if (last?.street) lastAddressParts.push(last.street);
  if (last?.city) lastAddressParts.push(last.city);
  if (last?.postcode) lastAddressParts.push(last.postcode);
  const lastAddress =
    lastAddressParts.length > 0
      ? lastAddressParts.join(", ")
      : null;

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <header>
        <h1 className="text-xl font-semibold">
          My account
        </h1>
        <p className="text-xs text-gray-500">
          Manage your basic details, view your default
          delivery information and review your recent orders.
        </p>
      </header>

      {/* رسائل حفظ */}
      {saveError && (
        <div className="border border-red-200 bg-red-50 text-xs text-red-700 rounded p-2">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="border border-green-200 bg-green-50 text-xs text-green-700 rounded p-2">
          {saveSuccess}
        </div>
      )}

      {/* قسم 1: تعديل الاسم والإيميل */}
      <section className="border rounded-lg bg-white p-4 text-sm">
        <h2 className="text-sm font-semibold mb-3">
          Account details
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1 text-xs">
            <label className="block font-medium">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="block font-medium">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder="your@email.com"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              This email is used for order confirmations and
              communication.
            </p>
          </div>

          <div className="pt-2 border-t mt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-black text-white text-xs font-medium hover:bg-gray-900 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>

      {/* قسم 2: آخر عنوان شحن (من آخر طلب) */}
      <section className="border rounded-lg bg-white p-4 text-sm">
        <h2 className="text-sm font-semibold mb-3">
          Last delivery details
        </h2>

        {!last ? (
          <p className="text-xs text-gray-500">
            We will save your delivery details once you place
            an order.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="font-medium">
                Name &amp; contact
              </p>
              {last.customerName && (
                <p>{last.customerName}</p>
              )}
              {last.businessName && (
                <p>{last.businessName}</p>
              )}
              {last.phone && <p>Phone: {last.phone}</p>}
            </div>

            <div className="space-y-1">
              <p className="font-medium">
                Delivery address
              </p>
              {lastAddress ? (
                <p>{lastAddress}</p>
              ) : (
                <p className="text-gray-500">
                  No address saved yet.
                </p>
              )}
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-500 mt-3">
          These details come from your most recent order and
          are used to pre-fill the checkout form.
        </p>
      </section>

      {/* قسم 3: سجل الطلبات */}
      <section className="border rounded-lg bg-white p-4 text-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">
            My recent orders
          </h2>
        </div>

        {ordersError && (
          <p className="text-xs text-red-600">
            {ordersError}
          </p>
        )}

        {!ordersError && orders.length === 0 && (
          <p className="text-xs text-gray-500">
            You have not placed any orders yet.
          </p>
        )}

        {orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-gray-50 border-b text-[11px] text-gray-600">
                <tr>
                  <th className="px-2 py-2 text-left">
                    Order
                  </th>
                  <th className="px-2 py-2 text-left">
                    Date
                  </th>
                  <th className="px-2 py-2 text-left">
                    Delivery
                  </th>
                  <th className="px-2 py-2 text-right">
                    Total
                  </th>
                  <th className="px-2 py-2 text-left">
                    Status
                  </th>
                  <th className="px-2 py-2 text-right">
                    Invoice
                  </th>
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

                  const deliveryLabel =
                    order.deliveryMethod === "PICKUP"
                      ? "Pickup"
                      : "Delivery";

                  const addrParts: string[] = [];
                  if (order.city) addrParts.push(order.city);
                  if (order.postcode)
                    addrParts.push(order.postcode);
                  const shortAddr =
                    addrParts.length > 0
                      ? addrParts.join(", ")
                      : "";

                  return (
                    <tr
                      key={order.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-2 py-2 align-top">
                        <span className="font-mono text-[11px]">
                          {order.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        {dateStr}
                      </td>
                      <td className="px-2 py-2 align-top">
                        {deliveryLabel}
                        {shortAddr && (
                          <div className="text-[10px] text-gray-500">
                            {shortAddr}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 align-top text-right">
                        {formatMoney(order.total)}
                      </td>
                      <td className="px-2 py-2 align-top">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[10px]">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top text-right">
                        <a
                          href={`/orders/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-blue-600 hover:underline"
                        >
                          View / Print
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
