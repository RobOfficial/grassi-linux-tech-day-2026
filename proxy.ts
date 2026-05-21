import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/app", "/stand", "/scan", "/onboarding", "/admin"];
const ADMIN_ONLY = ["/admin"];
const NEXT_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/quest";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const sessionCookie =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    // Next strippa il basePath da nextUrl.pathname ma NON lo riapplica a redirect:
    // serve prefissare manualmente o l'utente finisce su https://host/login (404).
    url.pathname = `${NEXT_BASE_PATH}/login`;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Admin gate enforced server-side in pages (need DB access). Middleware only does presence check.
  void ADMIN_ONLY;

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/stand/:path*", "/scan/:path*", "/onboarding/:path*", "/admin/:path*"],
};
