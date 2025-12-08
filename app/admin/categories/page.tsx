// app/admin/categories/page.tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CategoriesPage() {
  const cats = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + New Category
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Slug</th>
              <th className="p-2 border text-left"># Products</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id}>
                <td className="p-2 border">{c.name}</td>
                <td className="p-2 border">{c.slug}</td>
                <td className="p-2 border">{(c as any)._count?.products ?? 0}</td>
                <td className="p-2 border text-center">
                  <Link
                    href={`/admin/categories/${c.id}/edit`}
                    className="mr-3 underline text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <form
                    method="post"
                    action={`/admin/categories/${c.id}/delete`}
                    className="inline"
                    onSubmit={(e) => {
                      if (!confirm("Delete this category?")) e.preventDefault();
                    }}
                  >
                    <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {cats.length === 0 && (
              <tr>
                <td className="p-4 text-center border" colSpan={4}>
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
