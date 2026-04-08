import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];
const PUBLIC_API = ["/api/vapi/webhook"];
const PROTECTED_API = ["/api/user/", "/api/vapi/", "/api/stripe/create-checkout", "/api/chat"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtectedPage = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedApi = PROTECTED_API.some((r) => pathname.startsWith(r));

  const isPublicApi = PUBLIC_API.some((r) => pathname.startsWith(r));
  if (isPublicApi) return NextResponse.next();
  if (!isProtectedPage && !isProtectedApi) return NextResponse.next();

  // NextAuth v5 uses AUTH_SECRET; getToken needs it passed explicitly
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  // In production over HTTPS, NextAuth v5 uses __Secure-authjs.session-token
  const secureCookie = req.nextUrl.protocol === "https:";
  const cookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const token = await getToken({ req, secret, cookieName });

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/api/user/:path*", "/api/vapi/:path*", "/api/stripe/create-checkout", "/api/chat"],
};
