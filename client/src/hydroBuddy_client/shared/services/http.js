/* ===== http.js ===== */

export default async function http(url, opts = {}) {
    const { body, headers, ...rest } = opts;
    const init = {
        ...rest,
        headers: { 'Content-Type': 'application/json', ...(headers || {}) },
        credentials: opts.credentials ?? 'include',
    };

    if (body !== undefined) {
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(url, init);
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
    }
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json') ? res.json() : res.text();
}
