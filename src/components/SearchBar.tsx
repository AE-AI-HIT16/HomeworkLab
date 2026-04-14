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
            const queryString = params.toString();
            router.replace(queryString ? `/dashboard?${queryString}` : "/dashboard");
        },
        [router, searchParams]
    );

    return (
        <div
            role="search"
            aria-label="Search assignments"
            className="hidden md:flex items-center bg-[var(--hw-surface-container-low)] px-3 py-1.5 rounded-lg border border-transparent focus-within:border-[var(--hw-primary)]/30 focus-within:ring-2 focus-within:ring-[var(--hw-primary)]/15 transition-colors"
        >
            <label htmlFor="dashboard-search" className="sr-only">
                Search assignments
            </label>
            <span className="material-symbols-outlined text-[var(--hw-outline)] text-sm mr-2">search</span>
            <input
                id="dashboard-search"
                className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-[var(--hw-outline)] outline-none"
                placeholder="Search assignments..."
                type="text"
                aria-label="Search assignments"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
            />
            {query && (
                <button
                    type="button"
                    onClick={() => handleSearch("")}
                    aria-label="Clear search"
                    className="text-[var(--hw-outline)] hover:text-[var(--hw-on-surface)] transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            )}
        </div>
    );
}
