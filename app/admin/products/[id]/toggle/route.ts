import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/authOptions'
import { prisma } from '../../../../../lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 })
  if (!user.isAdmin) return NextResponse.json({ ok:false, error:'Forbidden' }, { status:403 })

  const form = await req.formData()
  const isActive = String(form.get('isActive')) === 'true'

  await prisma.product.update({
    where: { id: params.id },
    data: { isActive },
  })

  return NextResponse.redirect(new URL('/admin/products', req.url))
}
