const API = process.env.REACT_APP_API_URL || "http://localhost:5050";

export async function http(path, opts = {}) {
    const url = API + path;
    const options = {
        credentials: "include", // <<< חשוב! שולח את ה-cookie לשרת
        headers: {
            "Content-Type": "application/json",
            ...(opts.headers || {}),
        },
        ...opts,
    };

    if (options.body && typeof options.body !== "string") {
        options.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch(e) { /* not json */ }
        const errMsg = json?.error || text || `HTTP ${res.status}`;
        throw new Error(errMsg);
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) return res.json();
    return null;
}

