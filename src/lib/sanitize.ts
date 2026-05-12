import DOMPurify, { type Config } from "isomorphic-dompurify";

const SANITIZE_CONFIG: Config = {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["class", "target", "rel"],
    FORBID_TAGS: ["script", "style"],
};

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}
