// http.js

// export function http(pathOrUrl, { method = "GET", headers, body } = {}) {
//
//     const url = pathOrUrl; // נתיב יחסי: "/esp/..."
//     const opts = {
//         method,
//         headers: { ...(headers || {}), Accept: "application/json, text/plain, */*" },
//         credentials: "include",
//     };
//
//     if (body instanceof URLSearchParams || typeof body === "string") {
//         opts.body = body;
//     } else if (body && typeof body === "object") {
//         opts.headers["Content-Type"] = opts.headers["Content-Type"] || "application/json";
//         opts.body = JSON.stringify(body);
//     }
//
//     return fetch(url, opts).then(async (r) => {
//         const text = await r.text();
//         let data = null;
//         if (text) {
//             try { data = JSON.parse(text); }
//             catch { data = text; }
//         }
//         if (!r.ok) {
//             const errMsg = data?.error || (typeof data === "string" ? data : `HTTP ${r.status}`);
//             throw new Error(errMsg);
//         }
//         return data ?? {};
//     });
// }

// http.js

export function http(url, { method = "GET", body, headers = {} } = {}) {
    const opts = {
        method,
        credentials: "include",
        cache: "no-store",
        headers: { "Content-Type": "application/json", ...headers },
    };
    if (body && !(body instanceof FormData)) opts.body = JSON.stringify(body);
    if (body instanceof FormData) delete opts.headers["Content-Type"];
    return fetch(url, opts).then(async r => {
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json?.error || r.statusText);
        return json;
    });
}
