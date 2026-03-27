"use server";


import { getCurrentUserRole } from "@/lib/roles";
import { saveMaterial } from "@/lib/google-sheets";
import { revalidatePath } from "next/cache";
import type { Material } from "@/types";

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
        const url = formData.get("url")?.toString().trim();
        const typeStr = formData.get("type")?.toString().trim();
        const publishedStr = formData.get("published")?.toString(); // from checkbox

        // Validate
        if (!title || !weekStr || !url || !typeStr) {
            return { error: "Vui lòng điền đầy đủ Tên tài liệu, Tuần, Link URL và Loại." };
        }

        const week = parseInt(weekStr, 10);
        if (isNaN(week) || week < 1) {
            return { error: "Số Tuần (Week) không hợp lệ." };
        }

        let type: "theory" | "video" | "slides" | "other" = "other";
        if (["theory", "video", "slides"].includes(typeStr)) {
            type = typeStr as "theory" | "video" | "slides";
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
