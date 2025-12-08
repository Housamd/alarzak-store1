// app/admin/products/new/page.tsx
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <ProductForm action="/admin/products/create" submitLabel="Create" categories={categories} />
    </main>
  );
}
