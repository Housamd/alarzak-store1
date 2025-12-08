// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">
          Page not found
        </h1>
        <p className="text-sm text-gray-600">
          The page you are looking for doesn&apos;t exist or
          may have been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center text-xs mt-2">
          <Link
            href="/"
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900"
          >
            Go to homepage
          </Link>
          <Link
            href="/products"
            className="px-4 py-2 rounded border hover:bg-gray-50"
          >
            Browse products
          </Link>
        </div>
      </div>
    </main>
  );
}
