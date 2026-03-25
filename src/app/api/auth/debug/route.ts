import { NextResponse } from "next/server";

// Temporary debug endpoint — REMOVE before production
export async function GET() {
    // List ALL env var keys (no values!) to understand what Vercel provides
    const allKeys = Object.keys(process.env).sort();

    return NextResponse.json({
        totalEnvVars: allKeys.length,
        authRelated: allKeys.filter(k => k.includes("AUTH") || k.includes("GITHUB")),
        googleRelated: allKeys.filter(k => k.includes("GOOGLE")),
        vercelRelated: allKeys.filter(k => k.includes("VERCEL")),
        nextRelated: allKeys.filter(k => k.startsWith("NEXT")),
        nodeEnv: process.env.NODE_ENV,
        // Check if vars exist (no values exposed)
        checks: {
            AUTH_SECRET: !!process.env.AUTH_SECRET,
            AUTH_GITHUB_ID: !!process.env.AUTH_GITHUB_ID,
            AUTH_GITHUB_SECRET: !!process.env.AUTH_GITHUB_SECRET,
            ADMIN_GITHUB_USERNAMES: !!process.env.ADMIN_GITHUB_USERNAMES,
            GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
        }
    });
}
