import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

// Authenticated users redirect away from these (NOT "/" — home page is for everyone)
const AUTH_PATHS = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access-token")?.value;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isAuthPath = AUTH_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Protected route without token → login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged-in user hitting auth pages → dashboard
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
