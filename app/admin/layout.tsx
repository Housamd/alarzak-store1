// app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-3">
        <div>
          <h1 className="text-2xl font-semibold">
            Admin dashboard
          </h1>
          <p className="text-xs text-gray-500">
            Internal area for managing products and orders.
          </p>
        </div>

        <nav className="flex flex-wrap gap-3 text-xs">
          <Link
            href="/admin"
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Overview
          </Link>
          <Link
            href="/admin/orders"
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Orders
          </Link>
          <Link
            href="/admin/products"
            className="px-3 py-1 border rounded hover:bg-gray-50"
          >
            Products
          </Link>
        </nav>
      </header>

      <section>{children}</section>
    </div>
  );
}
