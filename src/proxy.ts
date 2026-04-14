import { auth } from "@/auth";

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";
import type { Session } from "next-auth";

/**
 * Next.js 16 proxy (middleware) for route protection.
 *
 * Handles 1 layer only:
 *   1. Authentication — unauthenticated → /login
 * 
 * Authorization (roles / admin guard) is handled in Node.js server components
 * because reading from Google Sheets requires Node.js runtime (googleapis).
 */
export const proxy = auth((req: NextRequest & { auth: Session | null }) => {
    const { pathname } = req.nextUrl;
    const publicPaths = ["/", "/login", "/unauthorized", "/about", "/contact", "/privacy", "/terms", "/help"];

    // Public pages — no auth required
    const isPublic =
        publicPaths.includes(pathname) ||
        pathname.startsWith("/api/auth");

    if (isPublic) return NextResponse.next();

    // 1. Must be logged in
    if (!req.auth?.user) {
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }

    const username = (req.auth.user as { githubUsername?: string }).githubUsername;
    if (!username) {
        return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
