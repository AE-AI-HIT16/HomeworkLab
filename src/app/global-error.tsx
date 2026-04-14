"use client";

/**
 * global-error.tsx — catches errors in the root layout itself.
 * Must include its own <html> and <body> tags since the root layout
 * is unavailable when this renders.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f8fafc",
                        padding: "1.5rem",
                    }}
                >
                    <div
                        style={{
                            maxWidth: "28rem",
                            width: "100%",
                            textAlign: "center",
                            background: "#fff",
                            padding: "2rem",
                            borderRadius: "1rem",
                            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            System error
                        </h1>
                        <p style={{ color: "#64748b", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                            The application encountered a critical issue. Please try again.
                        </p>
                        {error.digest && (
                            <p style={{ color: "#94a3b8", fontSize: "0.75rem", fontFamily: "monospace", marginBottom: "1rem" }}>
                                {error.digest}
                            </p>
                        )}
                        <button
                            onClick={reset}
                            style={{
                                background: "#4648d4",
                                color: "#fff",
                                border: "none",
                                padding: "0.625rem 1.5rem",
                                borderRadius: "0.5rem",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
