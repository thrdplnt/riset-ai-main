import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/utils/jwt";
import { ROUTES } from "@/routes";

const publicRoutes = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
];

const adminRoutes: string[] = [
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_MODELS,
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((route) => route === pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, req.url));
  }

  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute && payload.role !== "admin") {
    return NextResponse.redirect(new URL(ROUTES.CHAT, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};