// app/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/siteSettings";
import ProductCard from "@/components/products/ProductCard";

type PriceMode = "RETAIL" | "WHOLESALE";

async function getPriceMode(): Promise<PriceMode> {
  const cookieStore = cookies();
  const session = cookieStore.get("customer_session");
  const customerId = session?.value;

  let mode: PriceMode = "RETAIL";

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

function getProductPrice(
  product: any,
  mode: PriceMode
): number {
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

  return mode === "WHOLESALE"
    ? wholesale ?? retail ?? 0
    : retail ?? wholesale ?? 0;
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const priceMode = await getPriceMode();

  // منتجات عامة نستخدمها لسكتشن المحلات والأسر
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
    take: 16,
  });

  const wholesaleProducts = allProducts.slice(0, 4);
  const retailProducts = allProducts.slice(4, 8);

  // عروض + short date
  const offerProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [{ isOnOffer: true }, { isShortDate: true }],
    },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
    take: 8,
  });

  // Best sellers
  const bestSellerProducts = await prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
    take: 8,
  });

  // ارتفاع الهيرو (نفس الفكرة السابقة، لكن مضبوط)
  const heightClass =
    settings.heroHeight === "SMALL"
      ? "h-48"
      : settings.heroHeight === "LARGE"
      ? "h-80"
      : "h-64";

  const alignClass =
    settings.heroContentAlign === "CENTER"
      ? "items-center text-center"
      : settings.heroContentAlign === "RIGHT"
      ? "items-end text-right"
      : "items-start text-left";

  const heroBgStyle = settings.heroImageUrl
    ? {
        backgroundImage: `url(${settings.heroImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundImage:
          "linear-gradient(to right, #111827, #1f2937)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      };

  return (
    <main className="flex flex-col gap-10 pb-10">
      {/* HERO */}
      <section
        className={`w-full ${heightClass} flex ${alignClass} justify-center relative`}
        style={{ ...heroBgStyle, color: "white" }}
      >
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative max-w-4xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
            {settings.heroTitle ||
              "Al-Razak Cash & Carry – for your shop and your home"}
          </h1>
          <p className="text-sm md:text-base opacity-90 max-w-2xl">
            {settings.heroSubtitle ||
              "Wholesale and retail groceries in Manchester: from premium Al-Razak basmati rice to oils, tins, spices and everyday essentials."}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link
              href="/products"
              className="px-4 py-2 rounded bg-white text-gray-900 font-medium hover:bg-gray-100"
            >
              Browse all products
            </Link>
            <Link
              href="/cart"
              className="px-4 py-2 rounded border border-white/70 text-white hover:bg-white/10"
            >
              View basket
            </Link>
          </div>
        </div>
      </section>

      {/* شريط معلومات المخزن */}
      <section className="bg-white border-y">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-gray-700">
          <div>
            <span className="font-semibold">
              New Smithfield Market, Manchester
            </span>
            <span className="mx-2 text-gray-400">•</span>
            <span>
              Unit D26b–D27, Whitworth Street East, Openshaw,
              M11 2WP
            </span>
          </div>
          <div className="text-gray-500">
            Mon–Fri 07:00–16:00 · Sat 07:00–12:00 · Sun closed
          </div>
        </div>
      </section>

      {/* Section 1: للمحلات والمطاعم */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base md:text-lg font-semibold">
              For shops & restaurants
            </h2>
            <p className="text-xs text-gray-600">
              Bulk rice, oils, tins and core ingredients for
              busy kitchens and convenience stores around
              Manchester. Order online and collect from New
              Smithfield Market or arrange delivery.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 border rounded hover:bg-gray-50"
            >
              View full wholesale range
            </Link>
          </div>
        </div>

        {wholesaleProducts.length === 0 ? (
          <p className="text-xs text-gray-500">
            No products available yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {wholesaleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                price={getProductPrice(product, priceMode)}
                priceMode={priceMode}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: للأسر والتسوّق المنزلي */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base md:text-lg font-semibold">
              For families & home shopping
            </h2>
            <p className="text-xs text-gray-600">
              Shop like the wholesalers: Al-Razak basmati,
              cooking oils, sugar, tea and more for your home
              kitchen – at fair prices from a trusted local
              cash & carry.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 border rounded hover:bg-gray-50"
            >
              Browse retail-friendly packs
            </Link>
          </div>
        </div>

        {retailProducts.length === 0 ? (
          <p className="text-xs text-gray-500">
            No products available yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {retailProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                price={getProductPrice(product, priceMode)}
                priceMode={priceMode}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 3: عروض و Short date */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base md:text-lg font-semibold">
              Offers & short date
            </h2>
            <p className="text-xs text-gray-600">
              Discounted lines, short date products and
              special promotions. Perfect for price-conscious
              buyers and quick turnover.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 border rounded hover:bg-gray-50"
            >
              View all products
            </Link>
          </div>
        </div>

        {offerProducts.length === 0 ? (
          <p className="text-xs text-gray-500">
            No offers or short-date products right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offerProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                price={getProductPrice(product, priceMode)}
                priceMode={priceMode}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 4: Best sellers */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1 max-w-xl">
            <h2 className="text-base md:text-lg font-semibold">
              Best sellers at Al-Razak
            </h2>
            <p className="text-xs text-gray-600">
              Our most requested lines – especially popular
              with shops and households that buy again and
              again.
            </p>
          </div>
          <div className="flex gap-2 text-xs">
            <Link
              href="/products"
              className="px-3 py-1.5 border rounded hover:bg-gray-50"
            >
              Explore full catalogue
            </Link>
          </div>
        </div>

        {bestSellerProducts.length === 0 ? (
          <p className="text-xs text-gray-500">
            No best sellers marked yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellerProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                price={getProductPrice(product, priceMode)}
                priceMode={priceMode}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 5: Delivery & collection */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="border rounded-lg bg-white p-4 text-xs text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="font-semibold text-sm mb-1">
              Delivery & collection
            </h2>
            <p>
              Order online and choose between{" "}
              <strong>delivery</strong> or{" "}
              <strong>pickup</strong> from our unit at New
              Smithfield Market, Manchester.
            </p>
          </div>
          <div className="text-[11px] text-gray-500 md:text-right">
            <p>Unit D26b–D27, New Smithfield Market</p>
            <p>Whitworth Street East, Openshaw, M11 2WP</p>
          </div>
        </div>
      </section>
    </main>
  );
}
