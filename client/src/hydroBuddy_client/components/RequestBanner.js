// RequestBanner.js

export default function RequestBanner({ loading, errorText, message }) {
    if (!loading && !errorText && !message) return null;
    return (
        <div
            style={{
                marginBottom: 10,
                padding: "8px 10px",
                borderRadius: 8,
                background: loading ? "rgba(255,255,255,0.06)" : "rgba(255,0,0,0.08)",
                border: loading ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,0,0,0.25)",
                fontSize: ".9rem",
            }}
        >
            {loading ? "Working…" : (errorText || message)}
        </div>
    );
}
