"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
    className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={
                className ??
                "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition text-sm"
            }
        >
            Đăng xuất
        </button>
    );
}
