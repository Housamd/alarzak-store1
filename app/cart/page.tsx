// app/cart/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";

export default function CartPage() {
  const { items, setItemQty, removeItem, clearCart } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const line = (item.price || 0) * (item.qty || 0);
    return sum + line;
  }, 0);

  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  const handleQtyChange = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      removeItem(id);
    } else {
      setItemQty(id, newQty);
    }
  };

  const handleQtyInput = (id: string, value: string) => {
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num <= 0) {
      // إذا أدخل صفر أو قيمة غريبة، نحذف العنصر
      removeItem(id);
    } else {
      setItemQty(id, num);
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">
          Your basket
        </h1>
        <p className="text-xs text-gray-500">
          Review your items before checkout. Prices shown
          include the current customer type (retail or trade).
        </p>
      </header>

      {items.length === 0 ? (
        <section className="border rounded-lg bg-white p-6 text-sm text-center space-y-3">
          <p>Your basket is currently empty.</p>
          <div className="flex justify-center gap-3 text-xs">
            <Link
              href="/products"
              className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900"
            >
              Browse products
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr] items-start">
          {/* قائمة المنتجات في السلة */}
          <section className="border rounded-lg bg-white divide-y">
            {items.map((item) => {
              const lineTotal =
                (item.price || 0) * (item.qty || 0);
              const imageSrc = item.image
                ? item.image.replace(/"/g, "")
                : "/placeholder-product.png";

              return (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 items-center"
                >
                  <div className="relative w-16 h-16 border rounded bg-white flex-shrink-0">
                    <Image
                      src={imageSrc}
                      alt={item.name}
                      fill
                      className="object-contain p-1.5"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      £{(item.price || 0).toFixed(2)} each
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <div className="inline-flex items-center border rounded overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            handleQtyChange(
                              item.id,
                              -1
                            )
                          }
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={999}
                          value={item.qty}
                          onChange={(e) =>
                            handleQtyInput(
                              item.id,
                              e.target.value
                            )
                          }
                          className="w-12 text-center border-l border-r py-1 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleQtyChange(
                              item.id,
                              1
                            )
                          }
                          className="px-2 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        className="text-[11px] text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right text-sm font-semibold flex-shrink-0">
                    £{lineTotal.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </section>

          {/* ملخص السلة */}
          <section className="border rounded-lg bg-white p-4 space-y-3 text-sm">
            <h2 className="text-sm font-semibold">
              Order summary
            </h2>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                  £{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600 text-xs">
                <span>VAT (20%)</span>
                <span>
                  £{vat.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold pt-1 border-t mt-1">
                <span>Total</span>
                <span>
                  £{total.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              Final VAT and prices are still recalculated on
              the server at checkout.
            </p>

            <div className="flex flex-col gap-2 text-xs">
              <Link
                href="/checkout"
                className="w-full px-4 py-2 rounded bg-black text-white text-center font-medium hover:bg-gray-900"
              >
                Proceed to checkout
              </Link>
              <Link
                href="/products"
                className="w-full px-4 py-2 rounded border text-center hover:bg-gray-50"
              >
                Continue shopping
              </Link>
              <button
                type="button"
                onClick={clearCart}
                className="w-full px-4 py-2 rounded text-center text-[11px] text-red-600 hover:bg-red-50"
              >
                Clear basket
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
