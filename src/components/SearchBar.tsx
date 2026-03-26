"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get("q") ?? "");

    const handleSearch = useCallback(
        (value: string) => {
            setQuery(value);
            const params = new URLSearchParams(searchParams.toString());
            if (value.trim()) {
                params.set("q", value.trim());
            } else {
                params.delete("q");
            }
            router.replace(`/dashboard?${params.toString()}`);
        },
        [router, searchParams]
    );

    return (
        <div className="hidden md:flex items-center bg-[var(--hw-surface-container-low)] px-3 py-1.5 rounded-lg">
            <span className="material-symbols-outlined text-[var(--hw-outline)] text-sm mr-2">search</span>
            <input
                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-[var(--hw-outline)] outline-none"
                placeholder="Search assignments..."
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => handleSearch("")}
                    className="text-[var(--hw-outline)] hover:text-[var(--hw-on-surface)] transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            )}
        </div>
    );
}
