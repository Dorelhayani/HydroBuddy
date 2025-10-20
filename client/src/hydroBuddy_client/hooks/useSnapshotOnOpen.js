import { useEffect, useState } from "react";

// export function useSnapshotOnOpen(source, isOpen) {
//     const [snap, setSnap] = useState(null);
//     useEffect(() => { if (isOpen) setSnap(source ?? null); }, [isOpen, source]);
//     return snap;
// }


export function useSnapshotOnOpen(source, isOpen) {
    const [snap, setSnap] = useState(null);
    useEffect(() => { if (isOpen && source != null) setSnap(source); }, [isOpen, source]);
    return snap ?? source ?? null; // מחזיר תמיד "הכי טוב שיש"
}


// כלי קטן: צילום מצב בעת פתיחת גב הכרטיס – הטופס נשען על snapshot יציב ולא על sensors שמתעדכנים
