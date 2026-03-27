# 🎓 HomeworkLab

HomeworkLab là một nền tảng quản lý bài tập hiện đại (AI-focused) được xây dựng hoàn toàn từ con số 0 nhằm phục vụ các lớp học có quy mô nhỏ/vừa, tập trung vào hiệu suất cao và giao diện người dùng tối giản. 

Dự án được viết bằng **Next.js 16 (App Router)** và tận dụng tối đa Server Components/Server Actions.

## ✨ Tính năng nổi bật

- 🔐 **SSO GitHub Auth**: Đăng nhập nhanh bằng GitHub. Phân quyền bảo mật học viên/admin chặt chẽ cấp độ Edge Middleware.
- 📁 **Google Drive Integration**: Tự động stream file nộp (.pdf, .zip, .ipynb, .docx) trực tiếp từ máy sinh viên lên Google Drive của trung tâm mà không đi qua bộ nhớ nền (tránh quá tải).
- 🗄️ **Google Sheets as Database**: Kết nối với Google Sheets để lưu cấu trúc sinh viên, điểm số, và tiến độ View Details (Upsert real-time). Tiện lợi cho giáo viên xuất Excel.
- 🔗 **Repo Assignment**: Sinh viên có thể nộp thẳng GitHub Repo Link kèm theo validator chuẩn định dạng.
- 📊 **Teacher Dashboard View**: Thống kê danh sách Missing (chưa nộp), Late (nộp trễ), File/Repo upload counts linh hoạt. Phân tách UI theo từng Tuần học (Week).

## 🛠️ Công nghệ sử dụng

- **Framework**: [Next.js 16.2.1](https://nextjs.org/) (React 19, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [Auth.js (NextAuth v5)](https://authjs.dev/)
- **BaaS**: Google Drive API v3 & Google Sheets API v4

## 🚀 Chạy trên môi trường Local

1. Yêu cầu bạn có [Node.js](https://nodejs.org/) > Bỏ túi phiên bản v18+.
2. Clone repository này về máy.
3. Cài đặt các thư viện:

```bash
npm install
```

4. Cấu hình biến môi trường bằng cách tạo file `.env.local`:
*(Tham khảo danh sách biến chi tiết tại [DEPLOY.md](./DEPLOY.md))*

5. Chạy server ở môi trường phát triển (Development):

```bash
npm run dev
```

6. Truy cập địa chỉ `http://localhost:3000` trên trình duyệt để thưởng thức ứng dụng.

## ☁️ Triển khai ứng dụng (Production)

Để đưa HomeworkLab lên mạng (Host trên Vercel), vui lòng tham khảo riêng tài liệu [DEPLOY.md](./DEPLOY.md) chứa từng bước click chuột hướng dẫn một cách tường minh và an toàn nhất.
