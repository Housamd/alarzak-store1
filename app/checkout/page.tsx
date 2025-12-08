"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

type DeliveryMethod = "SHIP" | "PICKUP";

type MeResponse = {
  id: string;
  name: string | null;
  email: string | null;
  lastOrder?: {
    customerName?: string | null;
    businessName?: string | null;
    street?: string | null;
    city?: string | null;
    postcode?: string | null;
    phone?: string | null;
  };
};

type Totals = {
  subtotal: number;
  vat: number;
  shipping: number;
  total: number;
  totalWeightKg: number;
};

export default function CheckoutPage() {
  const { items, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerType, setCustomerType] =
    useState<"BUSINESS" | "PERSONAL">("BUSINESS");
  const [businessName, setBusinessName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("SHIP");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(
    null
  );
  const [submitSuccess, setSubmitSuccess] = useState<
    string | null
  >(null);

  const hasItems = items && items.length > 0;

  // حساب محلي احتياطي لو فشل الـ API (fallback فقط)
  const localSubtotal = hasItems
    ? items.reduce(
        (sum, item) => sum + item.price * item.qty,
        0
      )
    : 0;
  const localVat = localSubtotal * 0.2;

  // Totals من السيرفر (اللي فيها الشحن والوزن الصحيحين)
  const [totals, setTotals] = useState<Totals | null>(null);
  const [totalsError, setTotalsError] =
    useState<string | null>(null);
  const [totalsLoading, setTotalsLoading] =
    useState(false);

  // ========== تحميل بيانات الحساب / آخر أوردر ==========
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/account/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return;

        const data: MeResponse = await res.json();
        if (cancelled) return;

        if (!customerName && data.name) {
          setCustomerName(data.name);
        }
        if (!email && data.email) {
          setEmail(data.email);
        }

        if (data.lastOrder) {
          const lo = data.lastOrder;
          if (lo.customerName && !customerName) {
            setCustomerName(lo.customerName);
          }
          if (lo.businessName && !businessName) {
            setBusinessName(lo.businessName);
          }
          if (lo.street && !street) {
            setStreet(lo.street);
          }
          if (lo.city && !city) {
            setCity(lo.city);
          }
          if (lo.postcode && !postcode) {
            setPostcode(lo.postcode);
          }
          if (lo.phone && !phone) {
            setPhone(lo.phone);
          }
        }
      } catch {
        // نتجاهل الخطأ هنا
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== تحميل totals من السيرفر (preview) ==========
  useEffect(() => {
    if (!hasItems) {
      setTotals(null);
      setTotalsError(null);
      return;
    }

    let cancelled = false;

    async function loadTotals() {
      try {
        setTotalsLoading(true);
        setTotalsError(null);

        const res = await fetch(
          "/api/checkout/preview",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              items: items.map((item) => ({
                productId: item.id,
                qty: item.qty,
              })),
            }),
          }
        );

        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => null);
          throw new Error(
            data?.error ||
              "Failed to calculate delivery and totals."
          );
        }

        const data = await res.json();

        if (cancelled) return;

        setTotals({
          subtotal: Number(
            data.subtotal ?? 0
          ),
          vat: Number(data.vat ?? 0),
          shipping: Number(
            data.shipping ?? 0
          ),
          total: Number(data.total ?? 0),
          totalWeightKg: Number(
            data.totalWeightKg ?? 0
          ),
        });
      } catch (err: any) {
        console.error(
          "Checkout preview error:",
          err
        );
        if (!cancelled) {
          setTotalsError(
            err?.message ||
              "Failed to calculate delivery and totals."
          );
          setTotals(null);
        }
      } finally {
        if (!cancelled) {
          setTotalsLoading(false);
        }
      }
    }

    loadTotals();

    return () => {
      cancelled = true;
    };
    // نربط التغيير بمحتوى السلة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasItems, JSON.stringify(items)]);

  // قيم تستخدم في العرض: server أولاً، وإلا fallback على المحلّي
  const subtotal =
    totals?.subtotal ?? localSubtotal;
  const vat = totals?.vat ?? localVat;
  const shipping = totals?.shipping ?? 0;
  const total =
    totals?.total ?? subtotal + vat + shipping;
  const totalWeightKg =
    totals?.totalWeightKg &&
    totals.totalWeightKg > 0
      ? totals.totalWeightKg
      : null;

  // ========== إرسال الطلب ==========
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!hasItems) {
      setSubmitError(
        "Your cart is empty. Please add items before placing an order."
      );
      return;
    }

    if (
      !customerName.trim() ||
      !street.trim() ||
      !city.trim() ||
      !postcode.trim() ||
      !phone.trim()
    ) {
      setSubmitError(
        "Please fill in all required fields (marked with *)."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName,
        customerType,
        businessName: businessName || null,
        street,
        city,
        postcode,
        phone,
        email: email || null,
        deliveryMethod,
        notes: notes || null,
        items: items.map((item) => ({
          productId: item.id,
          qty: item.qty,
        })),
      };

      const res = await fetch(
        "/api/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          text ||
            "Failed to submit order. Please try again."
        );
      }

      const data = await res
        .json()
        .catch(() => ({}));

      const msg =
        data?.message ||
        (data?.reference
          ? `Order placed successfully. Reference: ${data.reference}`
          : "Order placed successfully.");

      setSubmitSuccess(msg);
      clearCart();
    } catch (err: any) {
      setSubmitError(
        err?.message ||
          "Failed to submit order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ========= RETURN JSX =========

  return (
    <main className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          Checkout
        </h1>
        <p className="text-xs text-gray-500">
          Please confirm your details, delivery
          information and charges before placing the
          order.
        </p>
      </header>

      {/* success message + print button */}
      {submitSuccess && (
        <div className="border border-green-200 bg-green-50 text-green-700 text-xs rounded p-3 space-y-2">
          <p>{submitSuccess}</p>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-1.5 rounded border border-green-600 text-[11px] font-medium hover:bg-green-600 hover:text-white transition"
          >
            Print this page
          </button>

          <p className="text-[11px] text-gray-600">
            For best results, use your
            browser&apos;s print function (Ctrl+P /
            Cmd+P) and select A4 paper size.
          </p>
        </div>
      )}

      {/* error */}
      {submitError && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-xs rounded p-3">
          {submitError}
        </div>
      )}

      {/* "cart empty" alert if no success yet */}
      {!hasItems && !submitSuccess && (
        <section className="border rounded-lg bg-white p-4 text-sm">
          <p className="text-gray-600">
            Your cart is currently empty.
          </p>
          <div className="mt-3">
            <Link
              href="/products"
              className="inline-block px-4 py-2 border rounded text-xs hover:bg-gray-50"
            >
              Browse products →
            </Link>
          </div>
        </section>
      )}

      {/* FORM + SUMMARY */}
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] items-start">
        {/* FORM */}
        <section className="border rounded-lg bg-white p-4 text-sm">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Customer type */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">
                Customer type
              </h2>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="BUSINESS"
                    checked={
                      customerType === "BUSINESS"
                    }
                    onChange={() =>
                      setCustomerType("BUSINESS")
                    }
                  />
                  <span>
                    Business / Trade
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="customerType"
                    value="PERSONAL"
                    checked={
                      customerType === "PERSONAL"
                    }
                    onChange={() =>
                      setCustomerType("PERSONAL")
                    }
                  />
                  <span>
                    Personal / Household
                  </span>
                </label>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">
                Contact details
              </h2>

              <div className="grid gap-3 md:grid-cols-2 text-xs">
                <div className="space-y-1">
                  <label className="block">
                    Full name{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(
                        e.target.value
                      )
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">
                    Business / shop name
                    {customerType ===
                      "BUSINESS" && (
                      <span className="text-red-600">
                        *
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) =>
                      setBusinessName(
                        e.target.value
                      )
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder={
                      customerType ===
                      "BUSINESS"
                        ? "Restaurant, shop or business name"
                        : "Optional"
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">
                    Phone{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Delivery details */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">
                Delivery / collection details
              </h2>

              <div className="flex flex-wrap gap-3 text-xs mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="SHIP"
                    checked={
                      deliveryMethod === "SHIP"
                    }
                    onChange={() =>
                      setDeliveryMethod("SHIP")
                    }
                  />
                  <span>Delivery</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="PICKUP"
                    checked={
                      deliveryMethod ===
                      "PICKUP"
                    }
                    onChange={() =>
                      setDeliveryMethod("PICKUP")
                    }
                  />
                  <span>
                    Collection from warehouse
                  </span>
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 text-xs">
                <div className="space-y-1 md:col-span-2">
                  <label className="block">
                    Street address{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) =>
                      setStreet(e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">
                    City / town{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) =>
                      setCity(e.target.value)
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block">
                    Postcode{" "}
                    <span className="text-red-600">
                      *
                    </span>
                  </label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) =>
                      setPostcode(
                        e.target.value
                      )
                    }
                    className="w-full border rounded px-2 py-1 text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1 text-xs">
              <label className="block">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
                className="w-full border rounded px-2 py-1 text-xs min-h-[60px]"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 border-t mt-2">
              <button
                type="submit"
                disabled={
                  loading ||
                  (!hasItems && !submitSuccess)
                }
                className="px-5 py-2 rounded bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
              >
                {loading
                  ? "Placing order..."
                  : "Place order"}
              </button>
            </div>
          </form>
        </section>

        {/* ORDER SUMMARY */}
        <section className="border rounded-lg bg-white p-4 text-sm space-y-3">
          <h2 className="text-sm font-semibold">
            Order summary
          </h2>

          {!hasItems && !submitSuccess ? (
            <p className="text-xs text-gray-600">
              No items in your cart yet.
            </p>
          ) : (
            <>
              {hasItems && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between"
                    >
                      <span>
                        {item.qty} ×{" "}
                        {item.name}
                      </span>
                      <span>
                        £
                        {(
                          item.price *
                          item.qty
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* حالة حساب الشحن والـ totals */}
              {totalsError && (
                <p className="text-[11px] text-red-600">
                  {totalsError}
                </p>
              )}
              {totalsLoading && hasItems && (
                <p className="text-[11px] text-gray-500">
                  Calculating delivery and totals...
                </p>
              )}

              <div className="space-y-1 text-xs pt-2 border-t">
                <div className="flex justify-between">
                  <span>Subtotal (goods)</span>
                  <span>
                    £{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (20%)</span>
                  <span>£{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Shipping
                    {totalWeightKg && (
                      <span className="block text-[10px] text-gray-500">
                        {`Estimated weight ${totalWeightKg.toFixed(
                          2
                        )} kg @ £4 per 14kg`}
                      </span>
                    )}
                  </span>
                  <span>
                    £{shipping.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-1 font-semibold">
                  <span>Total</span>
                  <span>
                    £{total.toFixed(2)}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-gray-500">
                Final VAT and totals are confirmed
                on the official invoice and
                warehouse paperwork.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
