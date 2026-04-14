"use server";


import { getCurrentUserRole } from "@/lib/roles";
import { saveMaterial } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import type { Material, MaterialContentMode } from "@/types";
import { getActiveCourseIds } from "@/lib/courses";

export interface CreateMaterialFormState {
    success?: boolean;
    error?: string;
    materialId?: string;
}

export async function createMaterialAction(
    prevState: CreateMaterialFormState,
    formData: FormData
): Promise<CreateMaterialFormState> {
    try {
        // Enforce Admin role
        const { role } = await getCurrentUserRole();
        if (role !== "admin") {
            return { error: "You do not have permission to perform this action (admin role required)." };
        }

        // Extract form data
        const title = formData.get("title")?.toString().trim();
        const weekStr = formData.get("week")?.toString().trim();
        const typeStr = formData.get("type")?.toString().trim();
        const publishedStr = formData.get("published")?.toString();
        const contentModeStr = (formData.get("contentMode")?.toString().trim() || "link") as string;

        // New fields
        const url = formData.get("url")?.toString().trim() || "";
        const postContent = formData.get("postContent")?.toString() || "";
        const courseId = formData.get("courseId")?.toString().trim() || "";

        // Validate common fields
        if (!courseId || !getActiveCourseIds().includes(courseId)) {
            return { error: "Please select a valid course for this material." };
        }
        if (!title || !weekStr || !typeStr) {
            return { error: "Please provide title, week, and material type." };
        }

        const week = parseInt(weekStr, 10);
        if (isNaN(week) || week < 1) {
            return { error: "Invalid week value." };
        }

        let type: "theory" | "video" | "slides" | "other" = "other";
        if (["theory", "video", "slides"].includes(typeStr)) {
            type = typeStr as "theory" | "video" | "slides";
        }

        // Validate content mode
        let contentMode: MaterialContentMode = "link";
        if (["link", "file", "post"].includes(contentModeStr)) {
            contentMode = contentModeStr as MaterialContentMode;
        }

        // Mode-specific validation
        if (contentMode === "link" && !url) {
            return { error: "Please enter a URL for this material." };
        }
        if (contentMode === "file" && !url) {
            return { error: "Please enter a Google Drive URL for file preview." };
        }
        if (contentMode === "post" && !postContent.trim()) {
            return { error: "Please provide post content (Markdown)." };
        }

        const published = publishedStr === "on";

        // Generate ID
        const id = `mat-${Date.now()}`;

        // Construct Material object
        const material: Material = {
            id,
            courseId,
            week,
            title,
            url,
            type,
            published,
            contentMode,
            postContent: contentMode === "post" ? postContent : undefined,
        };

        // Save to Google Sheets
        await saveMaterial(material);

        // Invalidate caching for the syllabus view
        revalidatePath("/courses/[slug]", "page");

        return { success: true, materialId: id };
    } catch (error: unknown) {
        console.error("Create Material Action Error:", error);
        const message = error instanceof Error ? error.message : "";
        return { error: message || "A system error occurred while saving this material." };
    }
}
