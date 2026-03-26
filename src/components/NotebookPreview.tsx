"use client";

import { useEffect, useState, useCallback } from "react";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/github.css";
import { marked } from "marked";

hljs.registerLanguage("python", python);

interface NotebookCell {
    cell_type: "markdown" | "code" | "raw";
    source: string | string[];
    outputs?: NotebookOutput[];
    metadata?: Record<string, unknown>;
}

interface NotebookOutput {
    output_type: string;
    text?: string | string[];
    data?: { "text/plain"?: string | string[]; "text/html"?: string | string[] };
}

interface Notebook {
    nbformat: number;
    cells: NotebookCell[];
    metadata?: {
        kernelspec?: { display_name?: string; language?: string };
        language_info?: { name?: string };
    };
}

function getCellSource(cell: NotebookCell): string {
    if (Array.isArray(cell.source)) return cell.source.join("");
    return cell.source ?? "";
}

function getOutputText(output: NotebookOutput): string {
    if (output.text) {
        return Array.isArray(output.text) ? output.text.join("") : output.text;
    }
    if (output.data?.["text/plain"]) {
        const t = output.data["text/plain"];
        return Array.isArray(t) ? t.join("") : t;
    }
    return "";
}

function MarkdownCell({ source }: { source: string }) {
    const html = marked.parse(source, { async: false }) as string;
    return (
        <div
            className="prose prose-sm max-w-none text-[var(--hw-on-surface)] px-5 py-4
                prose-headings:font-semibold prose-headings:text-[var(--hw-on-surface)]
                prose-code:bg-slate-100 prose-code:text-orange-700 prose-code:px-1 prose-code:rounded
                prose-pre:bg-slate-100 prose-pre:text-slate-800
                prose-a:text-[var(--hw-primary)]"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

function CodeCell({ source, index }: { source: string; index: number }) {
    const highlighted = hljs.highlight(source, { language: "python" }).value;
    return (
        <div className="group">
            <div className="flex items-center gap-2 px-5 pt-3 pb-1">
                <span className="text-[10px] font-mono font-bold text-slate-400">In [{index}]:</span>
            </div>
            <div className="relative mx-4 mb-4">
                <pre className="bg-[#f6f8fa] rounded-lg overflow-x-auto text-sm leading-relaxed p-4 border border-slate-200">
                    <code
                        className="language-python font-mono"
                        dangerouslySetInnerHTML={{ __html: highlighted }}
                    />
                </pre>
            </div>
        </div>
    );
}

function OutputSection({ outputs }: { outputs: NotebookOutput[] }) {
    if (!outputs || outputs.length === 0) return null;
    const texts = outputs.map(getOutputText).filter(Boolean);
    if (texts.length === 0) return null;

    return (
        <div className="mx-4 mb-4 border-l-2 border-slate-200 pl-4">
            <p className="text-[10px] font-mono font-bold text-slate-400 mb-1">Out:</p>
            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                {texts.join("\n")}
            </pre>
        </div>
    );
}

interface NotebookPreviewProps {
    driveFileId: string;
    name: string;
}

export function NotebookPreview({ driveFileId, name }: NotebookPreviewProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notebook, setNotebook] = useState<Notebook | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotebook = useCallback(async () => {
        if (notebook || loading) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/drive/file?id=${driveFileId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: Notebook = await res.json();
            setNotebook(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Không thể tải notebook");
        } finally {
            setLoading(false);
        }
    }, [driveFileId, notebook, loading]);

    const handleToggle = useCallback(() => {
        const next = !isOpen;
        setIsOpen(next);
        if (next && !notebook && !loading) {
            fetchNotebook();
        }
    }, [isOpen, notebook, loading, fetchNotebook]);

    const totalCells = notebook?.cells?.length ?? 0;
    const codeCells = notebook?.cells?.filter((c) => c.cell_type === "code").length ?? 0;

    return (
        <div className="rounded-xl overflow-hidden border border-orange-200/60 shadow-sm bg-white">
            {/* Header — always visible */}
            <button
                type="button"
                onClick={handleToggle}
                className="w-full flex items-center gap-3 p-4 hover:bg-orange-50/50 transition-colors group text-left"
            >
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-orange-600">data_object</span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--hw-on-surface)] truncate">{name}</p>
                    <p className="text-[10px] text-orange-600 font-medium">
                        Jupyter Notebook
                        {notebook && ` · ${totalCells} cells · ${codeCells} code`}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-orange-700 font-bold rounded-full">
                        .ipynb
                    </span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                        expand_more
                    </span>
                </div>
            </button>

            {/* Preview panel */}
            {isOpen && (
                <div className="border-t border-orange-100">
                    {loading && (
                        <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
                            <span className="material-symbols-outlined animate-spin text-[var(--hw-primary)]">progress_activity</span>
                            <span className="text-sm">Đang tải notebook...</span>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-5 text-red-600 bg-red-50">
                            <span className="material-symbols-outlined">error</span>
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {notebook && !loading && (
                        <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                            {/* Kernel info banner */}
                            {notebook.metadata?.kernelspec?.display_name && (
                                <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 border-b border-slate-100">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">terminal</span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {notebook.metadata.kernelspec.display_name}
                                    </span>
                                </div>
                            )}

                            {notebook.cells.map((cell, i) => {
                                const source = getCellSource(cell);
                                if (!source.trim()) return null;

                                if (cell.cell_type === "markdown") {
                                    return (
                                        <div key={i} className="bg-white border-l-4 border-l-transparent">
                                            <MarkdownCell source={source} />
                                        </div>
                                    );
                                }

                                if (cell.cell_type === "code") {
                                    const codeIndex = notebook.cells
                                        .slice(0, i + 1)
                                        .filter((c) => c.cell_type === "code").length;
                                    return (
                                        <div key={i} className="bg-white">
                                            <CodeCell source={source} index={codeIndex} />
                                            {cell.outputs && cell.outputs.length > 0 && (
                                                <OutputSection outputs={cell.outputs} />
                                            )}
                                        </div>
                                    );
                                }

                                return null;
                            })}

                            {/* Footer */}
                            <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">
                                    {totalCells} cells · nbformat {notebook.nbformat}
                                </span>
                                <a
                                    href={`https://drive.google.com/file/d/${driveFileId}/view`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] font-bold text-[var(--hw-primary)] flex items-center gap-1 hover:underline"
                                >
                                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                    Mở trên Drive
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
