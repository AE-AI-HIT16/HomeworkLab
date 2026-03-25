import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated session on the server side.
 * Returns the session or null if not authenticated.
 */
export async function getCurrentSession() {
    return await auth();
}

/**
 * Require an authenticated session.
 * Redirects to /login if no session exists.
 * Returns the guaranteed non-null session.
 */
export async function requireSession() {
    const session = await auth();
    if (!session?.user) {
        redirect("/login");
    }
    return session;
}
