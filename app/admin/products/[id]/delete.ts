// pages/api/admin/products/[id]/delete.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // عدّل المسار

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    // استخدم 405 حسب رغبتك
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { id } = req.query;

  // لو Int:
  // const parsed = Number(id);
  // if (!Number.isInteger(parsed) || parsed <= 0) {
  //   res.writeHead(303, { Location: '/admin/products' });
  //   return res.end();
  // }

  try {
    await prisma.product.delete({
      where: {
        // لو Int:
        // id: parsed
        // لو String/UUID/cuid:
        id: String(id),
      },
    });
  } catch (e) {
    // تجاهل لو غير موجود
  }

  // 303 redirect
  res.writeHead(303, { Location: '/admin/products' });
  res.end();
}
