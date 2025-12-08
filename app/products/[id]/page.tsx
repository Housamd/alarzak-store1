import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import ProductCard from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";

async function getPriceMode() {
  const cookieStore = cookies();
  const session = cookieStore.get("customer_session");
  const customerId = session?.value;

  let mode: "RETAIL" | "WHOLESALE" = "RETAIL";

  if (customerId) {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { customerType: true },
    });

    if (customer?.customerType === "WHOLESALE") {
      mode = "WHOLESALE";
    }
  }

  return mode;
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      categories: true,
    },
  });

  if (!product) {
    return (
      <main className="max-w-4xl mx-auto py-8 px-4">
        <p className="text-sm text-red-600">
          Product not found.
        </p>
      </main>
    );
  }

  const priceMode = await getPriceMode();

  const wholesale =
    product.wholesalePriceGBP !== null &&
    product.wholesalePriceGBP !== undefined
      ? Number(product.wholesalePriceGBP)
      : null;

  const retail =
    product.retailPriceGBP !== null &&
    product.retailPriceGBP !== undefined
      ? Number(product.retailPriceGBP)
      : null;

  const chosenPrice =
    priceMode === "WHOLESALE"
      ? wholesale ?? retail ?? 0
      : retail ?? wholesale ?? 0;

  const images = product.images || [];
  const imageSrc =
    images.length > 0
      ? String(images[images.length - 1]).replace(
          /"/g,
          ""
        )
      : "/placeholder-product.png";

  const clientProduct = {
    id: product.id,
    nameEn: product.nameEn,
    sku: product.sku,
    images: product.images,
  };

  const vatRate =
    typeof product.vatRate === "number"
      ? product.vatRate
      : 20;
  const vatLabel =
    vatRate === 0
      ? "0% VAT (exempt)"
      : "Price includes 20% VAT";

  // منتجات مشابهة
  let relatedProducts: typeof product[] = [];
  if (product.categories.length > 0) {
    const catIds = product.categories.map((c) => c.id);

    relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: product.id },
        categories: {
          some: { id: { in: catIds } },
        },
      },
      include: { categories: true },
      take: 4,
    });
  }

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* صورة كبيرة + تفاصيل */}
      <div className="grid gap-6 md:grid-cols-[1.1fr_1.2fr] items-start">
        {/* صورة المنتج */}
        <div className="border rounded-lg bg-white p-4 flex items-center justify-center">
          <div className="relative w-full h-96 md:h-[28rem]">
            <Image
              src={imageSrc}
              alt={product.nameEn}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* تفاصيل */}
        <div className="space-y-4">
          {product.categories && product.categories[0] && (
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {product.categories[0].name}
            </p>
          )}

          <h1 className="text-2xl md:text-3xl font-semibold">
            {product.nameEn}
          </h1>

          <div className="space-y-1">
            {chosenPrice > 0 ? (
              <>
                <p className="text-xl font-semibold">
                  £{chosenPrice.toFixed(2)}
                </p>
                <p className="text-[11px] text-gray-500">
                  {priceMode === "WHOLESALE"
                    ? "Wholesale / trade price."
                    : "Retail price."}
                </p>
                <p className="text-[11px] text-gray-500">
                  {vatLabel}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">
                Price on request. Please contact Al-Razak
                for pricing.
              </p>
            )}
          </div>

          {/* عدّاد واحد */}
          <AddToCartButton
            product={clientProduct}
            price={chosenPrice}
          />

          {/* معلومات إضافية */}
          <div className="border-t pt-3 text-xs space-y-1">
            {product.barcode && (
              <p>
                <span className="text-gray-500">
                  Barcode:
                </span>{" "}
                {product.barcode}
              </p>
            )}
            <p>
              <span className="text-gray-500">
                SKU:
              </span>{" "}
              {product.sku}
            </p>
            {product.countryOfOrigin && (
              <p>
                <span className="text-gray-500">
                  Country of origin:
                </span>{" "}
                {product.countryOfOrigin}
              </p>
            )}
            {product.grossWeightKg && (
              <p>
                <span className="text-gray-500">
                  Gross weight:
                </span>{" "}
                {Number(product.grossWeightKg).toFixed(3)}{" "}
                kg
              </p>
            )}
          </div>
        </div>
      </div>

      {/* وصف المنتج */}
      {product.description && (
        <section className="border rounded-lg bg-white p-4 text-sm space-y-2">
          <h2 className="text-sm font-semibold mb-1">
            Product description
          </h2>
          <p className="text-gray-700">
            {product.description}
          </p>
        </section>
      )}

      {/* منتجات مشابهة */}
      {relatedProducts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              You may also like
            </h2>
            <p className="text-[11px] text-gray-500">
              More products from this category.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => {
              const wholesaleP =
                p.wholesalePriceGBP !== null &&
                p.wholesalePriceGBP !== undefined
                  ? Number(p.wholesalePriceGBP)
                  : null;
              const retailP =
                p.retailPriceGBP !== null &&
                p.retailPriceGBP !== undefined
                  ? Number(p.retailPriceGBP)
                  : null;

              const relatedPrice =
                priceMode === "WHOLESALE"
                  ? wholesaleP ?? retailP ?? 0
                  : retailP ?? wholesaleP ?? 0;

              return (
                <ProductCard
                  key={p.id}
                  product={p}
                  price={relatedPrice}
                  priceMode={priceMode}
                />
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
