import { getCurrentUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { AdminSidebar } from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { role, session } = await getCurrentUserRole();
    if ((role !== "admin" && role !== "teacher") || !session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] flex flex-col font-sans">
            <TopNav user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                githubUsername: session.user.githubUsername
            }} role={role} />
            <div className="flex flex-1 pt-16">
                <AdminSidebar role={role} />
                <div className="flex-1 md:ml-56 relative w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
