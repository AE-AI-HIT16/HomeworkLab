"use client";

/**
 * global-error.tsx catches errors in the root layout itself. It renders WITHOUT
 * the root layout, so globals.css / Tailwind / fonts are unavailable here.
 * Everything is therefore inline-styled and self-contained. Keep it dependency-light.
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
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif", background: "#f6f8fb", color: "#14161b" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
          <div
            style={{
              maxWidth: "26rem",
              width: "100%",
              textAlign: "center",
              background: "#ffffff",
              padding: "2.25rem",
              borderRadius: "1rem",
              border: "1px solid #e2e6ec",
              boxShadow: "0 24px 56px -20px rgba(28,30,64,0.22)",
            }}
          >
            <div
              style={{
                width: "3rem",
                height: "0.375rem",
                borderRadius: "999px",
                background: "#4648d4",
                margin: "0 auto 1.5rem",
              }}
            />
            <h1 style={{ fontSize: "1.375rem", fontWeight: 800, letterSpacing: "-0.01em", margin: "0 0 0.5rem" }}>
              System error
            </h1>
            <p style={{ color: "#555b66", fontSize: "0.95rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
              The application hit a critical issue. Please try again.
            </p>
            {error.digest && (
              <p style={{ color: "#8a909c", fontSize: "0.75rem", fontFamily: "ui-monospace, monospace", margin: "0 0 1.25rem" }}>
                {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: "#4648d4",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.75rem",
                borderRadius: "999px",
                fontSize: "0.9rem",
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
