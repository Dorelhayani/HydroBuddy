// http.js

export function http(pathOrUrl, { method = "GET", headers, body } = {}) {

    const url = pathOrUrl; // נתיב יחסי: "/esp/..."
    const opts = {
        method,
        headers: { ...(headers || {}), Accept: "application/json, text/plain, */*" },
        credentials: "include",
    };

    if (body instanceof URLSearchParams || typeof body === "string") {
        opts.body = body;
    } else if (body && typeof body === "object") {
        opts.headers["Content-Type"] = opts.headers["Content-Type"] || "application/json";
        opts.body = JSON.stringify(body);
    }

    return fetch(url, opts).then(async (r) => {
        const text = await r.text();
        let data = null;
        if (text) {
            try { data = JSON.parse(text); }
            catch { data = text; }
        }
        if (!r.ok) {
            const errMsg = data?.error || (typeof data === "string" ? data : `HTTP ${r.status}`);
            throw new Error(errMsg);
        }
        return data ?? {};
    });
}
