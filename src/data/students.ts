import type { Student } from "@/types";

/**
 * Mock danh sách học viên được phép truy cập app.
 *
 * 🔄 Sau này thay bằng đọc từ Google Sheet:
 *    - Tạo hàm async fetchStudentsFromSheet()
 *    - Gọi Google Sheets API với GOOGLE_SHEET_ID
 *    - Parse dữ liệu sheet thành AllowedStudent[]
 *    - Có thể cache với revalidate để không gọi API mỗi request
 */
export const allowedStudents: Student[] = [
    {
        githubUsername: "student1",
        name: "Nguyễn Văn A",
        active: true,
        role: "student",
    },
    {
        githubUsername: "student2",
        name: "Trần Thị B",
        active: true,
        role: "student",
    },
    {
        githubUsername: "student3",
        name: "Lê Văn C",
        active: true,
        role: "student",
    },
    {
        githubUsername: "student4",
        name: "Phạm Thị D",
        active: false, // Inactive — không được truy cập
        role: "student",
    },
];

/**
 * Kiểm tra một GitHub username có trong danh sách học viên active không.
 *
 * 🔄 Khi chuyển sang Google Sheet, thay thế bằng:
 *    export async function isAllowedStudent(username: string): Promise<boolean> {
 *        const students = await fetchStudentsFromSheet();
 *        return students.some(s => s.githubUsername === username && s.active);
 *    }
 */
export function isAllowedStudent(githubUsername: string): boolean {
    return allowedStudents.some(
        (s) => s.githubUsername.toLowerCase() === githubUsername.toLowerCase() && s.active
    );
}

/**
 * Lấy thông tin học viên theo GitHub username.
 */
export function getStudentByUsername(githubUsername: string): Student | undefined {
    return allowedStudents.find(
        (s) => s.githubUsername.toLowerCase() === githubUsername.toLowerCase()
    );
}
