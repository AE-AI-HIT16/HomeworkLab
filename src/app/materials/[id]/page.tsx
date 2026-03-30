import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getCurrentUserRole } from "@/lib/roles";
import { getMaterials } from "@/lib/google-sheets";
import { TopNav } from "@/components/TopNav";

export const dynamic = "force-dynamic";

function renderMarkdown(content: string): string {
    return content
        // Code blocks (triple backtick)
        .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
            `<pre class="bg-slate-900 text-slate-100 rounded-xl p-4 overflow-x-auto my-4 text-sm font-mono"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
        // Headings
        .replace(/^#### (.+)$/gm, '<h4 class="text-base font-bold text-slate-800 mb-2 mt-5">$1</h4>')
        .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-slate-800 mb-2 mt-6">$1</h3>')
        .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-slate-900 mb-3 mt-8 pb-2 border-b border-slate-200">$1</h2>')
        .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-extrabold text-slate-900 mb-4 mt-8">$1</h1>')
        // Bold & italic
        .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
        // Unordered lists
        .replace(/^- (.+)$/gm, '<li class="ml-5 list-disc text-slate-700 leading-relaxed">$1</li>')
        // Ordered lists
        .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-5 list-decimal text-slate-700 leading-relaxed">$2</li>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 max-w-full shadow-sm"/>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800 underline font-medium">$1</a>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr class="my-6 border-slate-200"/>')
        // Paragraphs
        .replace(/\n\n/g, '</p><p class="text-slate-700 leading-relaxed mb-4">')
        .replace(/\n/g, '<br/>');
}

export default async function MaterialDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await requireSession();
    const { role } = await getCurrentUserRole();
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
                            <Link href="/courses/ai-core" className="shrink-0 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
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
        <div className="min-h-screen bg-[var(--hw-surface)] text-[var(--hw-on-surface)] antialiased">
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
                <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 pt-12 pb-10 px-6 md:px-12 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay" />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

                    <div className="max-w-3xl mx-auto relative z-10 text-white">
                        <Link href="/courses/ai-core" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium mb-6 transition-colors">
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
                                    __html: `<p class="text-slate-700 leading-relaxed mb-4">${renderMarkdown(material.postContent)}</p>`,
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
        </div>
    );
}
