"use client";

import { useTransition } from "react";
import { toggleStudentRole } from "@/app/admin/students/actions";

interface RoleToggleButtonProps {
    githubUsername: string;
    currentRole: "student" | "guest";
}

export function RoleToggleButton({ githubUsername, currentRole }: RoleToggleButtonProps) {
    const [isPending, startTransition] = useTransition();

    const nextRole = currentRole === "student" ? "guest" : "student";
    const isGuest = currentRole === "guest";

    const handleClick = () => {
        startTransition(async () => {
            await toggleStudentRole(githubUsername, nextRole);
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
                transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                ${isGuest
                    ? "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100"
                    : "bg-[var(--hw-primary-fixed)] text-[var(--hw-primary)] border border-[var(--hw-primary-fixed-dim)] hover:bg-indigo-100"
                }
            `}
            title={`Switch to ${nextRole === "guest" ? "Guest" : "Student"}`}
        >
            {isPending ? (
                <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
            ) : (
                <span className="material-symbols-outlined text-[14px]">
                    {isGuest ? "person_add" : "person_remove"}
                </span>
            )}
            {isPending
                ? "Updating..."
                : isGuest
                    ? "→ Student"
                    : "→ Guest"
            }
        </button>
    );
}
