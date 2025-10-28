// import { useEffect, useState } from "react";
//
// export function useSnapshotOnOpen(source, isOpen) {
//     const [snap, setSnap] = useState(null);
//     useEffect(() => { if (isOpen && source != null) setSnap(source); }, [isOpen, source]);
//     return snap ?? source ?? null;
// }

/* ===== useSnapshotOnOpen.js ===== */

import { useEffect, useRef, useState } from "react";

export function useSnapshotOnOpen(source, isOpen, { resetOnClose = false } = {}) {
    const [snap, setSnap] = useState(null);
    const wasOpen = useRef(false);

    useEffect(() => {
        if (isOpen && !wasOpen.current) {
            setSnap(source ?? null);
            wasOpen.current = true;
        }
        if (!isOpen && wasOpen.current) {
            wasOpen.current = false;
            if (resetOnClose) setSnap(null);
        }
    }, [isOpen]);

    return isOpen ? (snap ?? source ?? null) : (source ?? null);
}
