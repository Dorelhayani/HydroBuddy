export async function http(path, options = {}) {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
}

// function toArray(x) {
//     if (Array.isArray(x)) return x;
//     if (x && typeof x === "object") {
//         if (Array.isArray(x.state)) return x.state;
//         return Object.values(x);
//     }
//     return [];
// }