export async function http(path, options = {}) {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}