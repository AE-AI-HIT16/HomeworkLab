# Hướng dẫn Triển khai (Deployment Guide)

Tài liệu này hướng dẫn cách deploy **HomeworkLab** lên Vercel để chạy Production. Ứng dụng yêu cầu cấu hình các dịch vụ bên thứ 3 bao gồm GitHub OAuth, Google Drive, và Google Sheets.

---

## 🚀 1. Chuẩn bị Môi trường

Trước khi deploy, bạn cần thiết lập 3 dịch vụ sau và lấy các giá trị môi trường (Environment Variables).

### A. Cấu hình GitHub OAuth
Ứng dụng sử dụng GitHub để học viên và giáo viên đăng nhập.
1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers).
2. Chọn **New OAuth App**.
3. Điền thông tin:
   - **Application name**: Hệ thống View Details (HomeworkLab)
   - **Homepage URL**: `https://<ten-mien-vercel-cua-ban>.vercel.app`
   - **Authorization callback URL**: `https://<ten-mien-vercel-cua-ban>.vercel.app/api/auth/callback/github`
4. Lưu lại **Client ID** (`AUTH_GITHUB_ID`) và tạo một **Client Secret** (`AUTH_GITHUB_SECRET`).

### B. Cấu hình Authenticator Secret
Tạo một chuỗi bí mật để mã hóa Cookie Phiên Đăng Nhập (Session).
- Mở terminal chạy lệnh: `openssl rand -base64 32`
- Lưu chuỗi xuất ra thành `AUTH_SECRET`.

### C. Cấu hình Google Cloud (Google Sheets & Drive)
Hệ thống lưu file lên Drive và ghi data lên Sheets. Bạn cần một Service Account.
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo Project mới ➝ Bật **Google Drive API** và **Google Sheets API**.
3. Vào **IAM & Admin > Service Accounts** ➝ Tạo Service Account mới.
4. Ở tab **Keys** của Service Account đó, chọn **Add Key > Create New Key > JSON**. 
5. Tải file JSON về mở ra bằng Text Editor, bạn sẽ cần 2 trường:
   - `client_email`: Sẽ là `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `private_key`: Sẽ là `GOOGLE_PRIVATE_KEY` (Copy nguyên chuỗi bắt đầu bằng `-----BEGIN PRIVATE KEY...` đến hết dấu `=\n-----END PRIVATE KEY-----\n`).

### D. Chia sẻ Google Sheets và Google Drive
1. **Google Sheets**:
   - Tạo 1 file Google Sheets với 3 Tabs: `Students`, `Assignments`, `Submissions`.
   - Bấm Share góc trên bên phải, chia sẻ quyền **Editor** cho email Service Account (VD: `homework@my-project.iam.gserviceaccount.com`).
   - Lấy ID của File Sheets trên URL dán vào biến `GOOGLE_SHEET_ID`.
2. **Google Drive**:
   - Tạo 1 Thư mục gốc trên Drive của bạn để lớp View Details.
   - Chia sẻ quyền **Editor** cho email Service Account (giống hệt bên Sheets).
   - Lấy ID của thư mục dán vào `GOOGLE_DRIVE_ROOT_FOLDER_ID`.

---

## ☁️ 2. Hướng dẫn Deploy lên Vercel

1. Truy cập [Vercel](https://vercel.com) và đăng nhập bằng GitHub.
2. Bấm **Add New > Project** và chọn Repository chứa source code HomeworkLab.
3. Trong phần cấu hình **Environment Variables**, điền toàn bộ các biến sau:

| Tên biến | Giá trị lấy từ đâu |
| :--- | :--- |
| `AUTH_SECRET` | Chuỗi 32-byte sinh ra bằng openSSL |
| `AUTH_GITHUB_ID` | Client ID bên GitHub OAuth |
| `AUTH_GITHUB_SECRET` | Client Secret bên GitHub OAuth |
| `ADMIN_GITHUB_USERNAMES` | Danh sách admin, VD: `thanhnguyen,hahoang` |
| `GOOGLE_SHEET_ID` | Chữ số phía sau `/d/` trên link Google Sheets |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email tạo trong Google Cloud IAM |
| `GOOGLE_PRIVATE_KEY` | Private Key của Service Account JSON (Copy y nguyên) |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | ID của thư mục tạo bài tập trên Drive |

*⚠️ Lưu ý: Hệ thống đã bật Fail-Fast Validation (`src/lib/env.ts`), nếu thiếu bất kỳ biến nào trên đây, quá trình Deploy sẽ văng màn hình đỏ để bảo vệ dữ liệu, chống chạy ngầm.*

4. Bấm **Deploy**. Ngồi đợi 1-2 phút.
5. Khi hoàn tất, hệ thống sẽ cấp cho bạn 1 thẻ Domain giống dạng `https://homework-lab-xxx.vercel.app`. Hãy quay lại GitHub OAuth Setting, và kiểm tra chắc chắn Homepage URL / Callback URL đang cài khớp hoàn toàn đường link này.

🎉 *Chúc mừng! Lớp học AI của bạn đã chính thức Lên Sóng.*
