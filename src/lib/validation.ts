/**
 * Checks if a given string is a valid GitHub repository URL.
 * Example of valid formats:
 * - https://github.com/user/repo
 * - http://github.com/user/repo/tree/main
 */
export function isValidRepoUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;

    try {
        const parsed = new URL(url);
        // Ensure to only accept github.com or www.github.com
        if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
            return false;
        }

        // Ensure there is a username and a repo name in the path
        const pathSegments = parsed.pathname.split("/").filter(Boolean);
        return pathSegments.length >= 2;
    } catch {
        return false;
    }
}
