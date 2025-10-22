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
