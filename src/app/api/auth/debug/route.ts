import { NextResponse } from "next/server";

// Temporary debug endpoint under /api/auth/ path to bypass middleware
// REMOVE before production
export async function GET() {
    return NextResponse.json({
        hasAuthSecret: !!process.env.AUTH_SECRET,
        authSecretLength: process.env.AUTH_SECRET?.length ?? 0,
        authSecretFirst4: process.env.AUTH_SECRET?.substring(0, 4) ?? "MISSING",
        hasGithubId: !!process.env.AUTH_GITHUB_ID,
        githubIdValue: process.env.AUTH_GITHUB_ID ?? "MISSING",
        hasGithubSecret: !!process.env.AUTH_GITHUB_SECRET,
        githubSecretLength: process.env.AUTH_GITHUB_SECRET?.length ?? 0,
        githubSecretFirst4: process.env.AUTH_GITHUB_SECRET?.substring(0, 4) ?? "MISSING",
        nodeEnv: process.env.NODE_ENV,
        allAuthEnvKeys: Object.keys(process.env).filter(k => k.startsWith("AUTH") || k.startsWith("NEXT")).sort(),
    });
}
