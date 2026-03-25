/**
 * Server-only environment variable validation.
 * Guaranteed to fail fast during boot or during API routes/Server Actions 
 * if mandatory secrets are missing in production. 
 */

if (typeof window !== "undefined") {
    throw new Error("This module should only be imported on the server side.");
}

function getEnvVar(key: string, required = true): string {
    const value = process.env[key];

    // In production, missing required vars will throw.
    if (required && !value) {
        // Vercel build runs next build with NODE_ENV=production but without runtime secrets sometimes.
        // We bypass throwing if we are in the build phase.
        const isBuild = process.env.npm_lifecycle_event === "build" || process.env.NEXT_PHASE !== undefined;
        if (!isBuild && (process.env.NODE_ENV === "production" || process.env.STRICT_ENV === "true")) {
            throw new Error(`[HomeworkLab] Missing required environment variable: ${key}`);
        } else {
            console.warn(`[HomeworkLab] Warning: Missing ${key} (bypassed strict check for development/build).`);
            return "";
        }
    }

    return value || "";
}

export const env = {
    // Auth.js
    AUTH_SECRET: getEnvVar("AUTH_SECRET"),
    AUTH_GITHUB_ID: getEnvVar("AUTH_GITHUB_ID"),
    AUTH_GITHUB_SECRET: getEnvVar("AUTH_GITHUB_SECRET"),

    // App Config
    ADMIN_GITHUB_USERNAMES: getEnvVar("ADMIN_GITHUB_USERNAMES", false)
        .split(",")
        .map((u) => u.trim().toLowerCase())
        .filter(Boolean),

    // Google API
    GOOGLE_SHEET_ID: getEnvVar("GOOGLE_SHEET_ID", false),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: getEnvVar("GOOGLE_SERVICE_ACCOUNT_EMAIL", false),
    GOOGLE_PRIVATE_KEY: getEnvVar("GOOGLE_PRIVATE_KEY", false).replace(/\\n/g, "\n"),
    GOOGLE_DRIVE_ROOT_FOLDER_ID: getEnvVar("GOOGLE_DRIVE_ROOT_FOLDER_ID", false),
} as const;
