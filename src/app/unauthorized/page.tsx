import { LogoutButton } from "@/components/LogoutButton";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 max-w-md w-full rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl shadow-sm">
                    🔒
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    Không có quyền truy cập
                </h1>
                <p className="text-gray-600 leading-relaxed mb-8">
                    Tài khoản GitHub của bạn chưa được cấp quyền sử dụng hệ thống này. Vui lòng liên hệ với giáo viên (Admin) để được cấp quyền vào lớp học.
                </p>
                <div className="pt-4 border-t border-gray-100">
                    <LogoutButton className="w-full justify-center text-red-600 font-medium hover:bg-red-50 hover:text-red-700 bg-white border border-red-200" />
                </div>
            </div>
        </div>
    );
}
