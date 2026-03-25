import { NextResponse } from "next/server";

// Temporary debug endpoint — REMOVE before production
export async function GET() {
    return NextResponse.json({
        hasAuthSecret: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET?.length ?? 0,
        hasGithubId: !!process.env.AUTH_GITHUB_ID,
        githubIdPrefix: process.env.AUTH_GITHUB_ID?.substring(0, 6) ?? "MISSING",
        hasGithubSecret: !!process.env.AUTH_GITHUB_SECRET,
        githubSecretLength: process.env.AUTH_GITHUB_SECRET?.length ?? 0,
        nodeEnv: process.env.NODE_ENV,
    });
}
