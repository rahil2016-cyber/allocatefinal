import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("joballocate_token")?.value;
  const rawRole = request.cookies.get("joballocate_role")?.value?.toLowerCase();

  const role =
    rawRole === "company" || rawRole === "employer"
      ? "company"
      : rawRole === "job_seeker" || rawRole === "seeker"
      ? "job_seeker"
      : rawRole;

  // 1. Protect Employer Routes (/employer/*)
  if (pathname.startsWith("/employer")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "company");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role === "job_seeker") {
      // Security block: Job seeker attempting to access employer dashboard
      const seekerUrl = new URL("/seeker/dashboard", request.url);
      return NextResponse.redirect(seekerUrl);
    }
  }

  // 2. Protect Seeker Routes (/seeker/*)
  if (pathname.startsWith("/seeker")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("role", "job_seeker");
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (role === "company") {
      // Security block: Employer attempting to access job seeker dashboard
      const employerUrl = new URL("/employer/dashboard", request.url);
      return NextResponse.redirect(employerUrl);
    }
  }

  // 3. If already authenticated, redirect away from login/register unless explicit action
  if ((pathname === "/login" || pathname === "/register") && token && role) {
    // Only redirect if no logout query or change requested
    const hasLogoutParam = request.nextUrl.searchParams.has("logout");
    if (!hasLogoutParam) {
      if (role === "company") {
        return NextResponse.redirect(new URL("/employer/dashboard", request.url));
      }
      if (role === "job_seeker") {
        return NextResponse.redirect(new URL("/seeker/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/employer/:path*",
    "/seeker/:path*",
    "/login",
    "/register",
  ],
};
