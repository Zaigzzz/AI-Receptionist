import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/onboarding"];
const PROTECTED_API = ["/api/user/", "/api/vapi/", "/api/stripe/create-checkout"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isProtectedPage = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isProtectedApi = PROTECTED_API.some((r) => pathname.startsWith(r));

  if ((isProtectedPage || isProtectedApi) && !req.auth) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/api/user/:path*", "/api/vapi/:path*", "/api/stripe/create-checkout"],
};
