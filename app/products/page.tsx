// app/products/page.tsx
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import Link from "next/link";
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

type ProductsPageProps = {
  searchParams?: {
    category?: string;
    sort?: string;
  };
};

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const categorySlug = searchParams?.category || "all";
  const sortParam = searchParams?.sort || "name-asc";

  const priceMode = await getPriceMode();

  // جلب لائحة الكاتيجوريز لعرضها كفلتر
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(categorySlug !== "all"
          ? {
              categories: {
                some: { slug: categorySlug },
              },
            }
          : {}),
      },
      include: {
        categories: true,
      },
    }),
  ]);

  // ترتيب المنتجات في الذاكرة حسب sortParam
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortParam) {
      case "price-asc": {
        const aRetail = a.retailPriceGBP
          ? Number(a.retailPriceGBP)
          : 0;
        const bRetail = b.retailPriceGBP
          ? Number(b.retailPriceGBP)
          : 0;
        return aRetail - bRetail;
      }
      case "price-desc": {
        const aRetail = a.retailPriceGBP
          ? Number(a.retailPriceGBP)
          : 0;
        const bRetail = b.retailPriceGBP
          ? Number(b.retailPriceGBP)
          : 0;
        return bRetail - aRetail;
      }
      case "name-desc":
        return b.nameEn.localeCompare(a.nameEn);
      case "name-asc":
      default:
        return a.nameEn.localeCompare(b.nameEn);
    }
  });

  return (
    <main className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      {/* العنوان الرئيسي */}
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">
          Al-Razak product range
        </h1>
        <p className="text-xs text-gray-500 max-w-2xl">
          Browse the Al-Razak / Mediterranean World
          selection. Prices shown are based on your customer
          type:{" "}
          {priceMode === "WHOLESALE"
            ? "trade / wholesale customers."
            : "standard retail customers."}
        </p>
      </header>

      {/* شريط الفلترة والترتيب */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-xs">
        {/* فلتر الكاتيجوري */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-gray-500 mr-1">
            Category:
          </span>
          <Link
            href="/products?category=all&sort=name-asc"
            className={`px-3 py-1 rounded-full border ${
              categorySlug === "all"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(
                cat.slug
              )}&sort=${encodeURIComponent(sortParam)}`}
              className={`px-3 py-1 rounded-full border ${
                categorySlug === cat.slug
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* الترتيب */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">
            Sort by:
          </span>
          <div className="inline-flex border rounded overflow-hidden bg-white">
            <Link
              href={`/products?category=${encodeURIComponent(
                categorySlug
              )}&sort=name-asc`}
              className={`px-3 py-1 ${
                sortParam === "name-asc"
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              Name A–Z
            </Link>
            <Link
              href={`/products?category=${encodeURIComponent(
                categorySlug
              )}&sort=name-desc`}
              className={`px-3 py-1 border-l ${
                sortParam === "name-desc"
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              Name Z–A
            </Link>
            <Link
              href={`/products?category=${encodeURIComponent(
                categorySlug
              )}&sort=price-asc`}
              className={`px-3 py-1 border-l ${
                sortParam === "price-asc"
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              Price ↑
            </Link>
            <Link
              href={`/products?category=${encodeURIComponent(
                categorySlug
              )}&sort=price-desc`}
              className={`px-3 py-1 border-l ${
                sortParam === "price-desc"
                  ? "bg-black text-white"
                  : "hover:bg-gray-50"
              }`}
            >
              Price ↓
            </Link>
          </div>
        </div>
      </section>

      {/* عدد المنتجات + توضيح نوع السعر */}
      <section className="flex items-center justify-between text-[11px] text-gray-500">
        <span>
          Showing{" "}
          <span className="font-semibold">
            {sortedProducts.length}
          </span>{" "}
          products
          {categorySlug !== "all" && (
            <>
              {" "}
              in category{" "}
              <span className="font-semibold">
                {categories.find(
                  (c) => c.slug === categorySlug
                )?.name || categorySlug}
              </span>
            </>
          )}
        </span>
        <span>
          {priceMode === "WHOLESALE"
            ? "You are viewing wholesale prices."
            : "You are viewing retail prices."}
        </span>
      </section>

      {/* شبكة المنتجات */}
      {sortedProducts.length === 0 ? (
        <p className="text-sm text-gray-600">
          No products found for this filter.
        </p>
      ) : (
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedProducts.map((product) => {
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

              return (
                <div key={product.id} className="h-full">
                  <div className="h-full border rounded-lg bg-white hover:shadow-sm transition overflow-hidden">
                    <ProductCard
                      product={product}
                      price={chosenPrice}
                      priceMode={priceMode}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
