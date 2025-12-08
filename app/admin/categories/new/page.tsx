// app/admin/categories/new/page.tsx
export default function NewCategoryPage() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Create Category</h1>
      <form method="post" action="/admin/categories/create" className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" required className="w-full border rounded px-3 py-2" />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create</button>
      </form>
    </main>
  );
}
