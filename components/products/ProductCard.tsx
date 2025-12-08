"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartContext";

type Settings = {
  productImageHeight: number;
  productImageFit: string;
};

type ProductCardProps = {
  product: {
    id: string;
    nameEn: string;
    sku: string;
    images?: string[] | null;
    categories?: { name: string }[];
    vatRate?: number | null;
  };
  price: number;
  priceMode: "RETAIL" | "WHOLESALE";
};

export default function ProductCard({
  product,
  price,
  priceMode,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [settings, setSettings] = useState<Settings | null>(
    null
  );
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/settings", {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) {
          setSettings({
            productImageHeight:
              data.productImageHeight || 220,
            productImageFit:
              data.productImageFit || "contain",
          });
        }
      } catch {
        if (!cancelled) {
          setSettings({
            productImageHeight: 220,
            productImageFit: "contain",
          });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!settings) return null;

  // نأخذ آخر صورة في المصفوفة
  const imageSrc =
    product.images &&
    Array.isArray(product.images) &&
    product.images.length > 0
      ? String(
          product.images[product.images.length - 1]
        ).replace(/"/g, "")
      : "/placeholder-product.png";

  const fitClass =
    settings.productImageFit === "cover"
      ? "object-cover"
      : "object-contain";

  const firstCategory =
    product.categories && product.categories.length > 0
      ? product.categories[0].name
      : null;

  const canAdd = price > 0 && qty > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(
      {
        id: product.id,
        sku: product.sku,
        name: product.nameEn,
        price,
        image: imageSrc,
      },
      qty
    );
  };

  const changeQty = (delta: number) => {
    setQty((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > 999) return 999;
      return next;
    });
  };

  const vatRate =
    typeof product.vatRate === "number"
      ? product.vatRate
      : 20;
  const vatLabel =
    vatRate === 0
      ? "0% VAT (exempt)"
      : "Price includes 20% VAT";

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white hover:shadow-sm transition overflow-hidden">
      {/* صورة + اسم = رابط لصفحة المنتج */}
      <Link
        href={`/products/${product.id}`}
        className="flex-1 flex flex-col"
      >
        <div
          className="relative w-full border-b bg-white"
          style={{ height: settings.productImageHeight }}
        >
          <Image
            src={imageSrc}
            alt={product.nameEn}
            fill
            className={`${fitClass} p-3`}
          />
        </div>

        <div className="p-3 flex-1 flex flex-col gap-1">
          {firstCategory && (
            <p className="text-[10px] uppercase tracking-wide text-gray-500">
              {firstCategory}
            </p>
          )}

          <p className="text-sm font-medium leading-tight min-h-[36px]">
            {product.nameEn}
          </p>

          {price > 0 ? (
            <p className="text-sm font-semibold">
              £{Number(price).toFixed(2)}
            </p>
          ) : (
            <p className="text-xs text-gray-500">
              Contact for price
            </p>
          )}

          <p className="text-[10px] text-gray-400 mt-auto">
            SKU: {product.sku} –{" "}
            {priceMode === "WHOLESALE"
              ? "Wholesale"
              : "Retail"}
          </p>

          <p className="text-[10px] text-gray-500">
            {vatLabel}
          </p>
        </div>
      </Link>

      {/* عداد + زر إضافة للسلة */}
      <div className="px-3 pb-3 pt-1 flex flex-col gap-2">
        <div className="inline-flex items-center border rounded-md overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => changeQty(-1)}
            className="px-2 py-1 text-gray-700 hover:bg-gray-100"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={999}
            value={qty}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (Number.isNaN(value)) return;
              if (value < 1) setQty(1);
              else if (value > 999) setQty(999);
              else setQty(value);
            }}
            className="w-10 text-center border-l border-r py-1 text-xs outline-none"
          />
          <button
            type="button"
            onClick={() => changeQty(1)}
            className="px-2 py-1 text-gray-700 hover:bg-gray-100"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full text-xs px-3 py-1.5 rounded bg-black text-white font-medium hover:bg-gray-900 disabled:opacity-50"
        >
          {price > 0 ? "Add to basket" : "Contact for price"}
        </button>
      </div>
    </div>
  );
}
