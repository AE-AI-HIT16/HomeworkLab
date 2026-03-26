# 📋 Báo Cáo Thay Đổi — HIT AI/DATA Platform

**Ngày:** 26/03/2026  
**Nhánh:** `cuongld/feature/ui-localization-branding`  
**Người thực hiện:** Lâm Đức Cường (@CuongLam1206)

---

## 1. Branding & Localization

### Thay đổi
- Đổi tên toàn bộ platform từ **"HomeworkLab"** → **"HIT AI/DATA"**
- Dịch toàn bộ UI sang **tiếng Anh** (button, label, badge, error message)
- Dịch tên tài nguyên legacy tiếng Việt (VD: "Link Đề Bài") sang tiếng Anh qua helper `translateResourceName` trong `src/app/assignment/[id]/page.tsx`
- Đổi nút "Đăng xuất" → **"Sign Out"** (`src/components/LogoutButton.tsx`)

---

## 2. Navigation — Shared `TopNav` Component

**File:** `src/components/TopNav.tsx` *(file mới)*

### Thay đổi
- Tạo component navigation dùng chung cho toàn bộ app, thay thế các nav riêng lẻ
- **Role-aware:** Admin thấy thêm tab Analytics + Settings; Student chỉ thấy Dashboard
- **Active tab highlighting:** Tab hiện tại được gạch chân, dùng `usePathname()` với exact match để tránh highlight sai
- Xóa nút **"Create Assignment"** và **"View as Student"** khỏi TopNav (không cần thiết)
- Áp dụng `TopNav` cho:
  - `src/app/dashboard/page.tsx`
  - `src/app/admin/layout.tsx`
  - `src/app/assignment/[id]/page.tsx`

---

## 3. Admin Sidebar — `AdminSidebar.tsx`

**File:** `src/components/AdminSidebar.tsx`

### Thay đổi
- Chuyển sang **Client Component** (`"use client"`) để dùng `usePathname()`
- Highlight đúng item active kể cả sub-routes (VD: `/admin/grading/[id]` → highlight **Grading**)
- Thêm mục **Students** → `/admin/students`
- Thêm mục **Grading** → `/admin/grading`
- Xóa card promo **"New Module"** (không cần thiết)
- Xóa 2 nút placeholder **"Week X (Current)"** và **"Filter"** trên Analytics

---

## 4. Trang Admin Students — `/admin/students`

**File:** `src/app/admin/students/page.tsx` *(file mới)*

### Tính năng
- Hiển thị danh sách sinh viên với các chỉ số:
  - **Completion %** (thanh tiến độ)
  - **Submitted / Total** (số bài đã nộp)
  - **Late** (bài nộp trễ)
  - **Avg Score** (điểm trung bình)
  - **Status** badge: Missing / In Progress / Complete
- **Fallback thông minh:** Nếu sheet Students trống → tự lấy danh sách từ submissions

---

## 5. Trang Grading & Leaderboards

### `/admin/grading` — Danh sách bài tập
**File:** `src/app/admin/grading/page.tsx` *(file mới)*
- Liệt kê tất cả assignments đã published
- Mỗi bài hiển thị: Submitted / Graded / Avg Score
- Badge "CLOSED" cho bài đã qua deadline

### `/admin/grading/[id]` — Chi tiết chấm điểm
**File:** `src/app/admin/grading/[id]/page.tsx` *(file mới)*
- Stats: Progress, Graded, Avg Score, Due Date
- 🏆 **Leaderboard** xếp hạng sinh viên theo điểm (🥇🥈🥉), có cột Feedback
- Bảng **Grade Submissions** để chấm điểm từng em

---

## 6. Trang Admin Assignment Detail — `/admin/assignments/[id]`

**File:** `src/app/admin/assignments/[id]/page.tsx`

### Thay đổi
- Đổi nút "← Back to Dashboard" → **"← Back to Analytics"**
- Thêm section 🏆 **Leaderboard** (chỉ hiện khi có bài đã chấm)
- Xóa nút **"View Progress"** (redundant)

---

## 7. Sửa lỗi Bug

| Bug | Nguyên nhân | Fix |
|---|---|---|
| Progress hiển thị `2/7` nhưng bảng có 9 hàng | `stats.total` dùng `activeStudents.length` (7) thay vì `rows.length` (9) | Đổi sang `rows.length` trong `getAssignmentDetailsWithSubmissions` (`google-sheets.ts`) |
| Sidebar "Analytics" luôn highlight dù đang ở Students | `navClass` dùng `pathname === path` nhưng chưa xét sub-path | Thêm logic `pathname.startsWith(path + "/")` |
| TopNav tab Analytics highlight khi ở `/admin/students` | `isActive` dùng `startsWith("/admin")` | Đổi thành exact match `pathname === path` |

---

## 8. Files Đã Tạo Mới

| File | Mô tả |
|---|---|
| `src/components/TopNav.tsx` | Shared navigation component |
| `src/app/admin/students/page.tsx` | Trang danh sách sinh viên |
| `src/app/admin/grading/page.tsx` | Trang danh sách bài để chấm |
| `src/app/admin/grading/[id]/page.tsx` | Trang leaderboard + chấm điểm |
| `src/components/GradeSubmissionModal.tsx` | Modal chấm điểm |
| `src/app/admin/assignments/[id]/actions.ts` | Server action chấm điểm |

## 9. Files Đã Chỉnh Sửa

| File | Mô tả thay đổi |
|---|---|
| `src/components/AdminSidebar.tsx` | Client component, active nav, thêm Grading, xóa promo card |
| `src/components/LogoutButton.tsx` | "Đăng xuất" → "Sign Out" |
| `src/app/dashboard/page.tsx` | Dùng TopNav chung |
| `src/app/admin/layout.tsx` | Dùng TopNav chung |
| `src/app/admin/page.tsx` | Xóa filter placeholder buttons |
| `src/app/admin/assignments/[id]/page.tsx` | Back button, leaderboard |
| `src/app/assignment/[id]/page.tsx` | TopNav, translateResourceName helper |
| `src/lib/google-sheets.ts` | Fix `stats.total` dùng `rows.length` |
