import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import type { NextAuthConfig } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email?: string | null;
            image?: string | null;
            githubUsername: string;
        };
    }
}

declare module "@auth/core/jwt" {
    interface JWT {
        id: string;
        githubUsername: string;
    }
}

export const authConfig: NextAuthConfig = {
    trustHost: true,
    providers: [GitHub],

    pages: {
        signIn: "/login",
    },

    callbacks: {
        // Enrich JWT with GitHub profile data
        jwt({ token, profile }) {
            if (profile) {
                token.id = String(profile.id ?? "");
                token.githubUsername = String(profile.login ?? "");
            }
            return token;
        },

        // Expose enriched data in session
        session({ session, token }) {
            session.user.id = token.id;
            session.user.githubUsername = token.githubUsername;
            return session;
        },

        // Route protection: basic auth check (detailed role checks in proxy.ts)
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnLogin = nextUrl.pathname === "/login";
            const isPublic =
                nextUrl.pathname === "/" ||
                nextUrl.pathname === "/unauthorized" ||
                nextUrl.pathname.startsWith("/api/auth") ||
                nextUrl.pathname.startsWith("/api/debug");

            // Allow public pages
            if (isPublic || isOnLogin) return true;

            // Protect everything else
            if (!isLoggedIn) return false; // → redirect to signIn page

            return true;
        },
    },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
