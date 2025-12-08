// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // حماية /admin وكل ما تحته
  if (pathname.startsWith("/admin")) {
    // السماح فقط لصفحة تسجيل الدخول للأدمن بدون كوكي
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const adminAuth = req.cookies.get("admin_auth")?.value;

    if (adminAuth !== "1") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
