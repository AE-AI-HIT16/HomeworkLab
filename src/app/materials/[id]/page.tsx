import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getCurrentUserRoleWithContext } from "@/lib/roles";
import { getMaterials } from "@/lib/google-sheets";
import { TopNav } from "@/components/TopNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { marked } from "marked";

export const dynamic = "force-dynamic";

function renderMarkdown(content: string): string {
    return marked.parse(content, { async: false }) as string;
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await requireSession();
    const { role } = await getCurrentUserRoleWithContext({ session });
    const user = session.user;

    const allMaterials = await getMaterials();
    const material = allMaterials.find((m) => m.id === id);

    if (!material || !material.published) {
        notFound();
    }

    const typeLabels: Record<string, string> = {
        theory: "Theory",
        video: "Video",
        slides: "Slides",
        other: "Resource",
    };

    const typeIcons: Record<string, string> = {
        theory: "article",
        video: "play_circle",
        slides: "slideshow",
        other: "link",
    };
    const backToCourseHref = `/courses/${material.courseId || "ai-core"}`;

    // ── File Preview: Full-screen fixed layout ──
    if (material.contentMode === "file" && material.url) {
        return (
            <div className="h-screen flex flex-col bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased overflow-hidden">
                <TopNav
                    user={{
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        githubUsername: user.githubUsername,
                    }}
                    role={role}
                    showSearch={false}
                />

                {/* Compact toolbar */}
                <div className="pt-14 flex-none">
                    <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link href={backToCourseHref} className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </Link>
                            <div className="h-5 w-px bg-slate-200 shrink-0" />
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[16px] text-indigo-600">{typeIcons[material.type] || "article"}</span>
                                </div>
                                <div className="min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block">{typeLabels[material.type]} · Module {material.week}</span>
                                    <h1 className="text-sm font-bold text-slate-900 truncate">{material.title}</h1>
                                </div>
                            </div>
                        </div>
                        <a
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
                        >
                            Open in Drive
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                    </div>
                </div>

                {/* Iframe fills remaining space */}
                <div className="flex-1 min-h-0">
                    <iframe
                        src={material.url.replace('/view', '/preview').replace('/edit', '/preview')}
                        className="w-full h-full border-0"
                        allow="autoplay"
                    />
                </div>
            </div>
        );
    }

    // ── Post / Link: Article layout ──
    return (
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased pb-24 md:pb-0">
            <TopNav
                user={{
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    githubUsername: user.githubUsername,
                }}
                role={role}
                showSearch={false}
            />

            <main className="pt-16">
                {/* Compact Header */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 pt-12 pb-10 px-6 md:px-12 relative overflow-hidden">
                    <div className="max-w-3xl mx-auto relative z-10 text-white">
                        <Link href={backToCourseHref} className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back to Course
                        </Link>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                                <span className="material-symbols-outlined text-[18px]">{typeIcons[material.type] || "article"}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                                {typeLabels[material.type]} · Module {material.week}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                            {material.title}
                        </h1>
                    </div>
                </div>

                {/* Article Body */}
                <div className="max-w-3xl mx-auto px-6 md:px-8 py-10">
                    {material.contentMode === "post" && material.postContent ? (
                        <article className="bg-white border border-slate-200 rounded-2xl p-8 md:p-12 shadow-sm">
                            <div
                                className="prose prose-slate max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: renderMarkdown(material.postContent),
                                }}
                            />
                            {material.url && (
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <a
                                        href={material.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                        External reference
                                    </a>
                                </div>
                            )}
                        </article>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                            <span className="material-symbols-outlined text-[48px] text-slate-300 mb-4 block">open_in_new</span>
                            <p className="text-slate-500 mb-6">This material is an external link.</p>
                            <a
                                href={material.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                Open Resource
                                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </a>
                        </div>
                    )}
                </div>
            </main>

            <MobileBottomNav variant="student" />
        </div>
    );
}
