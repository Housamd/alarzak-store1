"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  qty: number;
  name: string;
  price: number;
  nameEn?: string | null;
  sku?: string | null;
  image?: string | null;
  retailPriceGBP?: number | null;
  wholesalePriceGBP?: number | null;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: any, qty?: number) => void;
  removeItem: (id: string) => void;
  setItemQty: (id: string, qty: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "alrazak_cart_v1";

function loadInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => {
      const name =
        typeof item.name === "string"
          ? item.name
          : typeof item.nameEn === "string"
          ? item.nameEn
          : "";

      const priceRaw =
        typeof item.price === "number"
          ? item.price
          : item.wholesalePriceGBP ??
            item.retailPriceGBP ??
            0;

      const price = Number(priceRaw) || 0;

      return {
        id: String(item.id),
        qty: Number(item.qty) || 1,
        name,
        price,
        nameEn: item.nameEn ?? null,
        sku: item.sku ?? null,
        image: item.image ?? null,
        retailPriceGBP: item.retailPriceGBP
          ? Number(item.retailPriceGBP)
          : null,
        wholesalePriceGBP: item.wholesalePriceGBP
          ? Number(item.wholesalePriceGBP)
          : null,
      } as CartItem;
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const initial = loadInitialCart();
    setItems(initial);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch {
      // ignore
    }
  }, [items]);

  const addItem = (product: any, qty: number = 1) => {
    if (!product || !product.id) return;

    setItems((prev) => {
      const existing = prev.find(
        (i) => i.id === product.id
      );
      if (existing) {
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }

      const name: string =
        product.name ??
        product.nameEn ??
        product.sku ??
        "Product";

      // أهم سطر: نفضّل product.price الذي حسبناه حسب نوع الزبون
      const priceRaw =
        product.price ??
        product.wholesalePriceGBP ??
        product.retailPriceGBP ??
        0;
      const price = Number(priceRaw) || 0;

      const newItem: CartItem = {
        id: String(product.id),
        qty,
        name,
        price,
        nameEn: product.nameEn ?? null,
        sku: product.sku ?? null,
        image: Array.isArray(product.images)
          ? (product.images[0] ?? null)
          : null,
        retailPriceGBP: product.retailPriceGBP
          ? Number(product.retailPriceGBP)
          : null,
        wholesalePriceGBP: product.wholesalePriceGBP
          ? Number(product.wholesalePriceGBP)
          : null,
      };

      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) =>
      prev.filter((i) => i.id !== id)
    );
  };

  const setItemQty = (id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) {
        return prev.filter((i) => i.id !== id);
      }
      return prev.map((i) =>
        i.id === id ? { ...i, qty } : i
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    setItemQty,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx)
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  return ctx;
}

export default CartProvider;
