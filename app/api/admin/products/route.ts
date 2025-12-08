import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/authOptions'
import { prisma } from '../../../../lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const user = session?.user as any
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    if (!user.isAdmin) {
      return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }

    const form = await req.formData()

    const sku = String(form.get('sku') || '').trim()
    const nameEn = String(form.get('nameEn') || '').trim()
    const description = String(form.get('description') || '').trim() || null
    const barcode = String(form.get('barcode') || '').trim() || null
    const countryOfOrigin = String(form.get('countryOfOrigin') || '').trim() || null
    const grossWeightRaw = String(form.get('grossWeightKg') || '').trim()
    const retailPriceRaw = String(form.get('retailPriceGBP') || '').trim()
    const wholesalePriceRaw = String(form.get('wholesalePriceGBP') || '').trim()

    if (!sku || !nameEn) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
    }

    // تحويل القيم الرقمية
    const grossWeightKg = grossWeightRaw ? Number(grossWeightRaw) : null
    const retailPriceGBP = Number(retailPriceRaw || 0)
    const wholesalePriceGBP = Number(wholesalePriceRaw || 0)

    if (isNaN(retailPriceGBP) || isNaN(wholesalePriceGBP)) {
      return NextResponse.json({ ok: false, error: 'Invalid price' }, { status: 400 })
    }

    if (grossWeightRaw && isNaN(Number(grossWeightRaw))) {
      return NextResponse.json({ ok: false, error: 'Invalid gross weight' }, { status: 400 })
    }

    // تجهيز مجلد الصور
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const imagesFiles = form.getAll('images') as File[]
    const selected = imagesFiles.slice(0, 4)
    const savedPaths: string[] = []

    for (const file of selected) {
      if (!file || typeof file === 'string') continue
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const ext =
        (file.type?.includes('png') && '.png') ||
        (file.type?.includes('jpeg') && '.jpg') ||
        (file.type?.includes('jpg') && '.jpg') ||
        '.png'

      const name = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`
      const dest = path.join(uploadsDir, name)
      await fs.writeFile(dest, buffer)

      // المسار العام للعرض على الموقع
      savedPaths.push(`/uploads/${name}`)
    }

    // حفظ المنتج في قاعدة البيانات
    await prisma.product.create({
      data: {
        sku,
        nameEn,
        description,
        barcode,
        countryOfOrigin,
        grossWeightKg,
        retailPriceGBP,
        wholesalePriceGBP,
        images: savedPaths,
        isActive: true,
      },
    })

    return NextResponse.redirect(new URL('/admin', req.url))
  } catch (err: any) {
    console.error('❌ Error while saving product:', err)
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
