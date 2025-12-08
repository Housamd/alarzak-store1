// components/products/ProductDetailClient.tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { Category } from "@prisma/client";
import { useCart } from "@/components/cart/CartContext";

type SerializedProduct = {
  id: string;
  nameEn: string;
  description: string | null;
  sku: string | null;
  images: string[];
  retailPriceGBP: string;
  wholesalePriceGBP: string;
  countryOfOrigin: string | null;
  grossWeightKg: string | null;
  categories: Category[];
};

function formatPriceGBP(value: string | number) {
  const num =
    typeof value === "number" ? value : Number.parseFloat(value as string);

  return `£${num.toFixed(2)}`;
}

// دالة تنظّف مسار الصورة من علامات التنصيص والمسافات الزائدة
function sanitizeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string") {
    return "/placeholder-product.png";
  }

  let cleaned = url.trim();

  // إزالة علامات تنصيص زائدة في البداية والنهاية إن وجدت
  cleaned = cleaned.replace(/^"+|"+$/g, "").replace(/^'+|'+$/g, "");

  // إذا بقيت قيمة فارغة بعد التنظيف، رجّع placeholder
  if (!cleaned) return "/placeholder-product.png";

  return cleaned;
}

export default function ProductDetailClient({
  product,
}: {
  product: SerializedProduct;
}) {
  const { addItem } = useCart();

  const mainImage = useMemo(
    () => sanitizeImageUrl(product.images?.[0]),
    [product.images]
  );

  const price = useMemo(
    () => Number.parseFloat(product.retailPriceGBP),
    [product.retailPriceGBP]
  );

  const onAdd = () => {
    addItem({
      id: product.id,
      name: product.nameEn,
      price,
      image: mainImage,
      qty: 1,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0">
      {/* أعلى الصفحة: رجوع + breadcrumb بسيط */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <div>
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          {product.categories[0] && (
            <>
              <span className="mx-1">/</span>
              <span>{product.categories[0].name}</span>
            </>
          )}
          <span className="mx-1">/</span>
          <span className="text-gray-700 font-medium">
            {product.nameEn}
          </span>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] items-start">
        {/* عمود الصور */}
        <div>
          <div className="bg-white border rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={mainImage}
              alt={product.nameEn}
              className="w-full h-full max-h-[450px] object-cover"
              onError={(e) => {
                // fallback أخير لو الملف غير موجود
                (e.currentTarget as HTMLImageElement).src =
                  "/placeholder-product.png";
              }}
            />
          </div>

          {/* سطر صغير لعرض مسار الصورة الحالي (Debug لطيف) */}
          <p className="mt-2 text-[11px] text-gray-500 break-all">
            Image path: <code>{mainImage}</code>
          </p>

          {/* ثامبنيل للصور الإضافية (لو موجودة) */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto mt-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="w-20 h-20 bg-white border rounded-lg overflow-hidden flex-shrink-0"
                >
                  <img
                    src={sanitizeImageUrl(img)}
                    alt={`${product.nameEn} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* عمود التفاصيل */}
        <div className="bg-white border rounded-xl p-4 md:p-6 flex flex-col gap-4 shadow-sm">
          {/* الاسم + SKU */}
          <div>
            <h1 className="text-xl md:text-2xl font-semibold mb-1">
              {product.nameEn}
            </h1>
            {product.sku && (
              <p className="text-xs text-gray-500">SKU: {product.sku}</p>
            )}
          </div>

          {/* السعر */}
          <div className="border-y py-3 flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {formatPriceGBP(product.retailPriceGBP)}
              </span>
              <span className="text-xs text-gray-500">incl. VAT (retail)</span>
            </div>

            <p className="text-xs text-gray-600">
              Wholesale:{" "}
                <span className="font-medium">
                  {formatPriceGBP(product.wholesalePriceGBP)}
                </span>{" "}
              per unit
            </p>
          </div>

          {/* معلومات سريعة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {product.countryOfOrigin && (
              <div className="border rounded-lg p-2">
                <p className="text-gray-500">Country of origin</p>
                <p className="font-medium text-gray-800">
                  {product.countryOfOrigin}
                </p>
              </div>
            )}

            {product.grossWeightKg && (
              <div className="border rounded-lg p-2">
                <p className="text-gray-500">Pack weight</p>
                <p className="font-medium text-gray-800">
                  {product.grossWeightKg} kg
                </p>
              </div>
            )}

            <div className="border rounded-lg p-2">
              <p className="text-gray-500">Availability</p>
              <p className="font-medium text-emerald-600">In stock</p>
            </div>

            <div className="border rounded-lg p-2">
              <p className="text-gray-500">Delivery / collection</p>
              <p className="font-medium text-gray-800">
                Ship or pickup (Manchester)
              </p>
            </div>
          </div>

          {/* زر السلة */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onAdd}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-black text-white text-sm font-medium hover:opacity-90"
            >
              Add to cart
            </button>

            <p className="text-[11px] text-gray-500">
              By adding this item to your cart, you can review your full order
              and confirm delivery or collection options at checkout.
            </p>
          </div>

          {/* الوصف */}
          {product.description && (
            <div className="mt-2">
              <h2 className="text-sm font-semibold mb-1">Product details</h2>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
