import { getCurrentUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { AdminTopNav } from "@/components/AdminTopNav";
import { AdminSidebar } from "@/components/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { role, session } = await getCurrentUserRole();
    if (role !== "admin" || !session) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] flex flex-col font-sans">
            <AdminTopNav user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                githubUsername: session.user.githubUsername
            }} />
            <div className="flex flex-1 pt-14">
                <AdminSidebar />
                <div className="flex-1 md:ml-56 relative w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
