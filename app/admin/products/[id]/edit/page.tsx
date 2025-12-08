// app/admin/products/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";
import ProductForm from "../../ProductForm";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id }, // لو Int: { id: Number(id) }
      include: { categories: { select: { id: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!product) {
    return (
      <main className="p-6">
        <p className="text-red-600">Product not found.</p>
        <a href="/admin/products" className="underline">Back</a>
      </main>
    );
  }

  const selected = product.categories.map((c) => c.id);

  return (
    <main className="p-6 space-y-8">
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <ProductForm
          action={`/admin/products/${product.id}/update`}
          submitLabel="Update"
          categories={categories}
          defaults={{
            nameEn: (product as any).nameEn ?? "",
            sku: (product as any).sku ?? "",
            barcode: (product as any).barcode ?? "",
            retailPriceGBP: String((product as any).retailPriceGBP ?? ""),
            wholesalePriceGBP: String((product as any).wholesalePriceGBP ?? ""),
            isActive: (product as any).isActive ?? true,
            countryOfOrigin: (product as any).countryOfOrigin ?? "",
            description: (product as any).description ?? "",
            selectedCategoryIds: selected,
          }}
        />
      </section>

      {/* قسم الصور اللي عملناه سابقاً ممكن تبقيه كما هو */}
    </main>
  );
}
