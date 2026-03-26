# Hướng dẫn lấy OAuth2 Refresh Token cho Google Drive API

Vì tài khoản của bạn là Gmail cá nhân (`@gmail.com`), việc dùng Service Account sẽ bị lỗi "Service Accounts do not have storage quota" (do Service Account có dung lượng = 0). Để dùng được 30TB dung lượng của bạn, hệ thống đã được chuyển sang dùng cơ chế **OAuth2 App**.

Bạn cần làm theo các bước sau để lấy `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` và `GOOGLE_REFRESH_TOKEN` điền vào file `.env`.

## Bước 1: Tạo OAuth2 Client ID trên Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Chọn Project của bạn (Project mà bạn đã tạo Service Account).
3. Tìm và chọn menu **APIs & Services** > **OAuth consent screen** (Màn hình chấp thuận OAuth).
   - Chọn **External** (Bên ngoài) -> Create.
   - Điền tên App (VD: "HomeworkLab"), email của bạn.
   - Bỏ qua các bước sau, ấn Save and Continue cho đến hết.
   - **Quan trọng:** Ở màn hình "OAuth consent screen", click nút **PUBLISH APP** (Xuất bản ứng dụng) để app chuyển sang trạng thái "In production". Nếu để "Testing", token sẽ hết hạn sau 7 ngày.

4. Vào **APIs & Services** > **Credentials** (Thông tin xác thực).
5. Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
6. Chọn Application type (Loại ứng dụng): **Web application**.
   - Name: "HomeworkLab Upload"
   - Authorized redirect URIs (URI chuyển hướng được phép): Thêm URL sau đây: `https://developers.google.com/oauthplayground`
7. Click **Create** (Tạo).
8. Copy **Client ID** và **Client Secret** vừa hiện ra, dán vào file `.env` của bạn:
   ```env
   GOOGLE_CLIENT_ID="dán-client-id-vào-đây"
   GOOGLE_CLIENT_SECRET="dán-client-secret-vào-đây"
   ```

## Bước 2: Lấy Refresh Token qua OAuth 2.0 Playground
1. Truy cập [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2. Nhìn góc trên cùng bên phải, click vào **biểu tượng bánh răng ⚙️ (OAuth 2.0 configuration)**.
   - Tích chọn **"Use your own OAuth credentials"**.
   - Điền **OAuth Client ID** và **OAuth Client secret** mà bạn vừa copy ở Bước 1 vào 2 ô trống.
   - Click Close.

3. Ở khung bên trái (Step 1):
   - Scroll xuống tìm **Drive API v3**. Mở rộng nó ra.
   - Tích chọn quyền: `https://www.googleapis.com/auth/drive`
   - Click nút **"Authorize APIs"** màu xanh.
   - Nó sẽ nhảy sang trang đăng nhập Google. Hãy chọn đúng tài khoản Gmail có 30TB Drive của bạn.
   - Sẽ có cảnh báo "Google hasn't verified this app" (Do app của bạn tự tạo), click **Tiếp tục (Advanced > Go to...)**. Tick chọn các quyền nếu nó hỏi và ấn Continue.

4. Sau khi authorize xong, nó sẽ tự động quay lại OAuth Playground (sang Step 2).
5. Ở Step 2, click nút **"Exchange authorization code for tokens"**.
6. Bạn sẽ thấy một cục JSON hiện ra. Hãy copy đoạn chuỗi của **`refresh_token`**.
7. Dán vào file `.env`:
   ```env
   GOOGLE_REFRESH_TOKEN="1//04....dán-refresh-token-vào-đây"
   ```

## Bước 3: Khởi động lại dự án
Lưu file `.env` và chạy lại server:
```bash
npm run dev
```

Hệ thống sẽ tự động dùng Refresh Token này để thay mặt bạn upload file, sử dụng dung lượng 30TB của bạn!
