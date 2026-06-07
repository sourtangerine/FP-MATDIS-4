import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const roleAccess: Record<string, string[]> = {
  ADMIN: ["/dashboard", "/map", "/laporan", "/monitoring"],
  OPERATOR: ["/dashboard", "/map", "/laporan"],
  KOORDINATOR_LAPANGAN: ["/dashboard", "/monitoring"],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const isLoggedIn = !!req.auth;

  // Redirect unauthenticated users to login
  if (!isLoggedIn && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect authenticated users away from login
  if (isLoggedIn && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Role-based access control
  if (isLoggedIn && pathname !== "/login") {
    const userRole = req.auth?.user?.role;
    if (userRole) {
      const allowedPaths = roleAccess[userRole] || [];
      const isAllowed = allowedPaths.some((path) => pathname.startsWith(path));
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
