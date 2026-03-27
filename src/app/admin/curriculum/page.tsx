import { getCurrentUserRole } from "@/lib/roles";
import { redirect } from "next/navigation";
import { getAssignments, getMaterials } from "@/lib/google-sheets";
import { AdminSidebar } from "@/components/AdminSidebar";
import { TopNav } from "@/components/TopNav";
import { CurriculumList } from "./CurriculumList";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
    const { role, session } = await getCurrentUserRole();
    if (role !== "admin" || !session) redirect("/dashboard");

    const [assignments, materials] = await Promise.all([
        getAssignments(),
        getMaterials(),
    ]);

    // Sort assignments by week then lesson
    const sortedAssignments = [...assignments].sort((a, b) => a.week - b.week || a.lesson - b.lesson);
    const sortedMaterials = [...materials].sort((a, b) => a.week - b.week);

    return (
        <>
            <TopNav user={{ name: session.user?.name || "", image: session.user?.image || "" }} role="admin" />
            <AdminSidebar />
            <main className="md:ml-56 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto md:mt-14 pb-24 md:pb-20">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 mb-1">Content Manager</p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Curriculum</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {assignments.length} assignments · {materials.length} materials
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/admin/materials/new" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">post_add</span>
                            Add Material
                        </Link>
                        <Link href="/admin/create-assignment" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20">
                            <span className="material-symbols-outlined text-[18px]">add_task</span>
                            Add Assignment
                        </Link>
                    </div>
                </div>

                {/* Content List */}
                <CurriculumList assignments={sortedAssignments} materials={sortedMaterials} />
            </main>
        </>
    );
}
