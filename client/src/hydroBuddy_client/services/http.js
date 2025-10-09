// http.js

const API = process.env.REACT_APP_API_URL || "http://localhost:5050";


export async function http(path, opts = {}) {
    const url = API + path;
    const isForm = opts.body instanceof FormData;

    const options = {
        credentials: "include",
        ...opts,
        headers: {
            ...(isForm ? {} : { "Content-Type": "application/json" }),
            ...(opts.headers || {}),
        },
        body: isForm
            ? opts.body
            : (opts.body && typeof opts.body !== "string" ? JSON.stringify(opts.body) : opts.body),
    };

    const res = await fetch(url, options);

    if (!res.ok) {
        // נסה JSON תחילה, ואז טקסט
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); msg = j?.error || msg; }
        catch { try { msg = await res.text(); } catch {} }
        throw new Error(msg);
    }

    const ct = res.headers.get("content-type") || "";
    if (res.status === 204) return null;
    if (ct.includes("application/json")) return res.json();
    return null;
}

// export const absoluteUrl = (p) => (p?.startsWith("http") ? p : API + p);