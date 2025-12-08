import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/authOptions'
import { prisma } from '../../../../../lib/prisma'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  if (!user) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 })
  if (!user.isAdmin) return NextResponse.json({ ok:false, error:'Forbidden' }, { status:403 })

  // احذف العناصر التابعة ثم المنتج
  await prisma.orderItem.deleteMany({ where: { productId: params.id } }).catch(()=>{})
  await prisma.product.delete({ where: { id: params.id } })

  // 303 لضمان الرجوع لصفحة GET
  const url = new URL('/admin/products', req.url)
  return NextResponse.redirect(url, { status: 303 })
}
