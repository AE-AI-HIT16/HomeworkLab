import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Export runtime to ensure this runs on Node.js (not Edge)
export const runtime = "nodejs";
