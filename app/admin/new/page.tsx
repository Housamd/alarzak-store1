// app/admin/new/page.tsx
import { redirect } from "next/navigation";

export default function AdminNewRedirectPage() {
  // إعادة توجيه إلى صفحة إنشاء منتج الجديدة
  redirect("/admin/products/new");
  return null;
}
