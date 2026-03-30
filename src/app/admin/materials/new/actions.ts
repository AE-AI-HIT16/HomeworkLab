"use server";


import { getCurrentUserRole } from "@/lib/roles";
import { saveMaterial } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import type { Material, MaterialContentMode } from "@/types";

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
            return { error: "Bạn không có quyền thực hiện hành động này (Yêu cầu quyền Admin)." };
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

        // Validate common fields
        if (!title || !weekStr || !typeStr) {
            return { error: "Vui lòng điền đầy đủ Tên tài liệu, Tuần, và Loại." };
        }

        const week = parseInt(weekStr, 10);
        if (isNaN(week) || week < 1) {
            return { error: "Số Tuần (Week) không hợp lệ." };
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
            return { error: "Vui lòng nhập URL link cho tài liệu." };
        }
        if (contentMode === "file" && !url) {
            return { error: "Vui lòng nhập Google Drive URL để preview file." };
        }
        if (contentMode === "post" && !postContent.trim()) {
            return { error: "Vui lòng viết nội dung bài post (Markdown)." };
        }

        const published = publishedStr === "on";

        // Generate ID
        const id = `mat-${Date.now()}`;

        // Construct Material object
        const material: Material = {
            id,
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
    } catch (error: any) {
        console.error("Create Material Action Error:", error);
        return { error: error.message || "Đã xảy ra lỗi hệ thống khi lưu tài liệu." };
    }
}
