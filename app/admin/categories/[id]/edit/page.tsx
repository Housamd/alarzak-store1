// app/admin/categories/[id]/edit/page.tsx
import { prisma } from "@/lib/prisma";

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const cat = await prisma.category.findUnique({ where: { id: params.id } });
  if (!cat) {
    return (
      <main className="p-6">
        <p className="text-red-600">Category not found.</p>
        <a href="/admin/categories" className="underline">Back</a>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
      <form method="post" action={`/admin/categories/${cat.id}/update`} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" defaultValue={cat.name} required className="w-full border rounded px-3 py-2" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Update</button>
      </form>
    </main>
  );
}
