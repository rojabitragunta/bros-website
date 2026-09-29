import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic redirect for signed-out visitors (cookie presence only — no DB).
 * The real checks (valid session, admin role, ownership) run on the server in
 * every protected page, Server Action and Route Handler.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has("bros_session")) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/admin")) {
    return pathname === "/admin/login" ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const login = new URL("/login", request.url);
  login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
