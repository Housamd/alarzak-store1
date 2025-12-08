// app/admin/products/new/page.tsx
import ProductForm from "../ProductForm";

export default function NewProductPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Create Product</h1>
      <ProductForm action="/admin/products/new" submitLabel="Create" />
    </main>
  );
}
