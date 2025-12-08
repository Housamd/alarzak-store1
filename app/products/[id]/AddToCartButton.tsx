"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartContext";

type AddToCartButtonProps = {
  product: {
    id: string;
    nameEn: string;
    sku: string;
    images?: string[] | null;
  };
  price: number;
};

export default function AddToCartButton({
  product,
  price,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const canAdd = price > 0 && qty > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    setLoading(true);

    try {
      addItem(
        {
          ...product,
          name: product.nameEn,
          price,
        },
        qty
      );
    } finally {
      setLoading(false);
    }
  };

  const changeQty = (delta: number) => {
    setQty((current) => {
      const next = current + delta;
      if (next < 1) return 1;
      if (next > 999) return 999;
      return next;
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
      {/* عدّاد الكمية */}
      <div className="inline-flex items-center border rounded-md overflow-hidden text-sm">
        <button
          type="button"
          onClick={() => changeQty(-1)}
          className="px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          aria-label="Decrease quantity"
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
          className="w-14 text-center border-l border-r py-1.5 text-sm outline-none"
        />
        <button
          type="button"
          onClick={() => changeQty(1)}
          className="px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* زر الإضافة للسلة */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd || loading}
        className="flex-1 sm:flex-none px-5 py-2 rounded bg-black text-white text-sm font-medium hover:bg-gray-900 disabled:opacity-50"
      >
        {price <= 0
          ? "Price on request"
          : loading
          ? "Adding..."
          : "Add to cart"}
      </button>
    </div>
  );
}
