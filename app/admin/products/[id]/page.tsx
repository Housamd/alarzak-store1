import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/authOptions'
import { prisma } from '../../../../lib/prisma'
import Link from 'next/link'

export default async function EditProduct({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return <main className="container py-10">Please login first.</main>
  if (!user.isAdmin) return <main className="container py-10">Unauthorized.</main>

  const p = await prisma.product.findUnique({ where: { id: params.id } })
  if (!p) return <main className="container py-10">Product not found.</main>

  const images = Array.isArray(p.images) ? p.images : []

  return (
    <main className="container py-10">
      <h1 className="mb-6 text-3xl font-bold text-brand-blue">Edit product</h1>

      <div className="mb-4">
        <Link href="/admin/products" className="btn btn-outline no-underline">← Back to list</Link>
      </div>

      <form
        action={`/api/admin/products/${p.id}`}
        method="POST"
        encType="multipart/form-data"
        className="space-y-4 max-w-2xl"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label>SKU</label>
            <input name="sku" className="w-full border p-2 rounded" defaultValue={p.sku} required />
          </div>
          <div>
            <label>Name (EN)</label>
            <input name="nameEn" className="w-full border p-2 rounded" defaultValue={p.nameEn} required />
          </div>
        </div>

        <div>
          <label>Description</label>
          <textarea name="description" className="w-full border p-2 rounded h-24" defaultValue={p.description||''} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label>Barcode</label>
            <input name="barcode" className="w-full border p-2 rounded" defaultValue={p.barcode||''} />
          </div>
          <div>
            <label>Country of origin</label>
            <input name="countryOfOrigin" className="w-full border p-2 rounded" defaultValue={p.countryOfOrigin||''} />
          </div>
          <div>
            <label>Gross weight (kg)</label>
            <input type="number" step="0.001" name="grossWeightKg" className="w-full border p-2 rounded"
              defaultValue={p.grossWeightKg ? Number(p.grossWeightKg).toFixed(3) : ''} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label>Retail Price (GBP)</label>
            <input type="number" step="0.01" name="retailPriceGBP" className="w-full border p-2 rounded"
              defaultValue={Number(p.retailPriceGBP).toFixed(2)} required />
          </div>
          <div>
            <label>Wholesale Price (GBP)</label>
            <input type="number" step="0.01" name="wholesalePriceGBP" className="w-full border p-2 rounded"
              defaultValue={Number(p.wholesalePriceGBP).toFixed(2)} required />
          </div>
        </div>

        <div className="border rounded p-3">
          <div className="font-semibold mb-2">Current images ({images.length})</div>
          {images.length === 0 && <div className="text-sm text-gray-500">No images</div>}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i)=>(
                <img key={i} src={img} className="h-20 w-20 rounded object-cover border" alt="" />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="replaceImages" value="true" />
            Replace images with new upload
          </label>
          <input type="file" name="images" multiple accept="image/*" className="block w-full border p-2 rounded" />
          <p className="text-xs text-gray-500">Select up to 4 files. If "Replace images" is checked and no files selected, images will be cleared.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" defaultChecked={p.isActive} />
            Active
          </label>
        </div>

        <button type="submit" className="px-5 py-2 bg-brand-green text-white rounded hover:bg-brand-blue transition">
          Save changes
        </button>
      </form>
    </main>
  )
}
