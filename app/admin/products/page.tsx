// app/admin/products/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import DeleteButton from "./DeleteButton";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: { select: { name: true } } },
  });

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <a
          href="/admin/products/new"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + New Product
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border text-left">ID</th>
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Categories</th>
              <th className="p-2 border text-left">SKU</th>
              <th className="p-2 border text-left">Weight (kg)</th>
              <th className="p-2 border text-left">Retail £</th>
              <th className="p-2 border text-left">Active</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const name = (p as any).nameEn ?? (p as any).name ?? "-";
              const sku = (p as any).sku ?? "-";
              const retail =
                (p as any).retailPriceGBP != null
                  ? String((p as any).retailPriceGBP)
                  : "-";
              const isActive =
                typeof (p as any).isActive === "boolean"
                  ? (p as any).isActive
                  : true;

              const cats = Array.isArray((p as any).categories)
                ? (p as any).categories.map((c: any) => c.name).join(", ")
                : "-";

              const weight =
                (p as any).grossWeightKg != null
                  ? Number((p as any).grossWeightKg).toFixed(3)
                  : "-";

              return (
                <tr key={String(p.id)}>
                  <td className="p-2 border">{String(p.id)}</td>
                  <td className="p-2 border">{name}</td>
                  <td className="p-2 border">{cats || "-"}</td>
                  <td className="p-2 border">{sku}</td>
                  <td className="p-2 border">{weight}</td>
                  <td className="p-2 border">{retail}</td>
                  <td className="p-2 border">{isActive ? "Yes" : "No"}</td>
                  <td className="p-2 border text-center">
                    <a
                      href={`/admin/products/${String(p.id)}/edit`}
                      className="mr-3 underline text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </a>
                    <DeleteButton id={p.id} />
                  </td>
                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td className="p-4 text-center border" colSpan={8}>
                  لا يوجد منتجات حالياً
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
