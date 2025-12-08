"use client";

type Category = { id: string | number; name: string };

type ProductFormProps = {
  action: string;
  defaults?: {
    nameEn?: string;
    sku?: string;
    barcode?: string;
    retailPriceGBP?: string | number;
    wholesalePriceGBP?: string | number;
    isActive?: boolean;
    countryOfOrigin?: string | null;
    description?: string | null;
    selectedCategoryIds?: Array<string | number>;
  };
  categories?: Category[]; // 👈 تمرير التصنيفات
  submitLabel?: string;
};

export default function ProductForm({
  action,
  defaults,
  categories = [],
  submitLabel = "Save",
}: ProductFormProps) {
  const selected = new Set((defaults?.selectedCategoryIds ?? []).map(String));

  return (
    <form method="post" action={action} encType="multipart/form-data" className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm mb-1">Name (English)</label>
        <input name="nameEn" defaultValue={defaults?.nameEn ?? ""} className="w-full border rounded px-3 py-2" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">SKU</label>
          <input name="sku" defaultValue={defaults?.sku ?? ""} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Barcode</label>
          <input name="barcode" defaultValue={defaults?.barcode ?? ""} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Retail Price (GBP)</label>
          <input name="retailPriceGBP" type="number" step="0.01" defaultValue={defaults?.retailPriceGBP ?? ""} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Wholesale Price (GBP)</label>
          <input name="wholesalePriceGBP" type="number" step="0.01" defaultValue={defaults?.wholesalePriceGBP ?? ""} className="w-full border rounded px-3 py-2" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Country of Origin</label>
          <input name="countryOfOrigin" defaultValue={defaults?.countryOfOrigin ?? ""} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-2">
          <input id="isActive" name="isActive" type="checkbox" defaultChecked={defaults?.isActive ?? true} className="h-4 w-4" />
          <label htmlFor="isActive" className="text-sm">Active</label>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea name="description" defaultValue={defaults?.description ?? ""} rows={4} className="w-full border rounded px-3 py-2" />
      </div>

      {/* صور */}
      <div>
        <label className="block text-sm mb-1">Images (you can select multiple)</label>
        <input name="images" type="file" accept="image/*" multiple className="w-full border rounded px-3 py-2" />
        <p className="text-xs text-gray-500 mt-1">Allowed: JPG/PNG/WebP. Max ~5MB per image (recommended).</p>
      </div>

      {/* التصنيفات */}
      <div>
        <label className="block text-sm mb-1">Categories</label>
        <select name="categoryIds" multiple className="w-full border rounded px-3 py-2 h-32">
          {categories.map((c) => (
            <option key={String(c.id)} value={String(c.id)} selected={selected.has(String(c.id))}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">اضغط Ctrl/Command للاختيار المتعدد.</p>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          {submitLabel}
        </button>
        <a href="/admin/products" className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</a>
      </div>
    </form>
  );
}
