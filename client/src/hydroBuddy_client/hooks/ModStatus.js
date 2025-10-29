/* ===== ModStatus.js ===== */

// import { useEffect, useState } from "react";
//
// export default function ModStatus() {
//     const [active, setActive] = useState(false);
//     const [loading, setLoading] = useState(false);
//
//     async function fetchState() {
//         try {
//             setLoading(true);
//             const res = await fetch("/esp/state", { credentials: "include" });
//             const json = await res.json();
//
//             const next =
//                 !!(json?.active?.on ??
//                     json?.active ??
//                     json?.MANUAL_MODE?.enabled ??
//                     json?.SATURDAY_MODE?.enabled ??
//                     false);
//
//             setActive(next);
//         } catch (e) {
//             console.warn("Failed to fetch /esp/state", e);
//         } finally {
//             setLoading(false);
//         }
//     }
//
//     useEffect(() => {
//         fetchState();
//         const id = setInterval(fetchState, 5000);
//         return () => clearInterval(id);
//     }, []);
//
//     return (
//         <span className={`mod-status__badge ${active ? "is-on" : "is-off"}`} aria-busy={loading}>
//       <span className="mod-status__dot" />
//       Mod: {active ? "Active" : "Inactive"}
//     </span>
//     );
// }



/* ===== ModStatus.js ===== */

import React from "react";

export default function ModStatus({ isActive, name }) {
    const loading = false;

    return (
        <span

            className={`mod-status__badge mod-status__${name.toLowerCase()} ${isActive ? "is-on" : "is-off"}`}
            aria-busy={loading}
        >
            <span className="mod-status__dot" />
            {name}: {isActive ? "Active" : "Inactive"}
        </span>
    );
}