// FlipCard.js

// import React from "react";
// export default function FlipCard({
//                                      front,
//                                      back,
//                                      flippable = true,
//                                      isFlipped,            // optional (controlled)
//                                      onFlip,               // optional (controlled)
//                                      defaultFlipped = false,
//                                      className = "",
//                                      style,
//                                      ...rest
//                                  }) {
//     const [innerFlipped, setInnerFlipped] = React.useState(defaultFlipped);
//     const flipped = isFlipped !== undefined ? isFlipped : innerFlipped;
//
//     const setFlipped = (v) => {
//         if (!flippable) return;
//         if (onFlip) onFlip(v);
//         else setInnerFlipped(v);
//     };
//
//     return (
//         <div
//             className={`flip-card ${flippable ? "" : "no-flip"} ${className}`}
//             style={style}
//             {...rest}
//         >
//             <div className={`flip-card-inner ${flipped ? "is-flipped" : ""}`}>
//                 <div className="flip-card-face front">
//                     {/* הצד הקדמי מקבל פונקציה flip כדי שתוכל לשים כפתור "Actions" */}
//                     {typeof front === "function" ? front({ flip: () => setFlipped(true) }) : front}
//                 </div>
//                 <div className="flip-card-face back">
//                     {/* הצד האחורי מקבל פונקציה unflip כדי לשים "Back" */}
//                     {typeof back === "function" ? back({ unflip: () => setFlipped(false) }) : back}
//                 </div>
//             </div>
//         </div>
//     );
// }

import React from "react";

export default function FlipCard({
                                     front,
                                     back,
                                     flippable = true,
                                     isFlipped = false,
                                     onFlip,
                                     autoHeight = true,
                                     className = "",
                                 }) {
    const innerRef = React.useRef(null);
    const frontRef = React.useRef(null);
    const backRef  = React.useRef(null);

    // מניעת עדכונים מיותרים (וכך שובי resize)
    const lastHeightRef = React.useRef(0);
    const rafIdRef = React.useRef(0);
    const needsMeasureRef = React.useRef(false);

    const doMeasure = React.useCallback(() => {
        if (!autoHeight) return;
        const frontEl = frontRef.current;
        const backEl  = backRef.current;
        const innerEl = innerRef.current;
        if (!frontEl || !backEl || !innerEl) return;

        // עדיף scrollHeight כדי לכלול תוכן שיכול לגלול
        const frontH = frontEl.scrollHeight || frontEl.getBoundingClientRect().height || 0;
        const backH  = backEl.scrollHeight  || backEl.getBoundingClientRect().height  || 0;
        const next = Math.max(frontH, backH, 1);

        // עדכן רק אם באמת השתנה (מונע לולאות)
        if (Math.abs(next - lastHeightRef.current) >= 1) {
            innerEl.style.minHeight = `${Math.ceil(next)}px`;
            lastHeightRef.current = next;
        }
    }, [autoHeight]);

    // לתזמן מדידה בפריים הבא (לא ישירות מתוך ה־observer)
    const scheduleMeasure = React.useCallback(() => {
        if (!autoHeight) return;
        if (needsMeasureRef.current) return; // כבר מתוזמן
        needsMeasureRef.current = true;
        rafIdRef.current && cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = requestAnimationFrame(() => {
            needsMeasureRef.current = false;
            doMeasure();
        });
    }, [autoHeight, doMeasure]);

    // מדידה ראשונית ובכל שינוי flip
    React.useEffect(() => {
        scheduleMeasure();
        return () => { rafIdRef.current && cancelAnimationFrame(rafIdRef.current); };
    }, [scheduleMeasure, isFlipped]);

    // ResizeObserver – רק מתזמן, לא מודד ישירות
    React.useEffect(() => {
        if (!autoHeight) return;
        const frontEl = frontRef.current;
        const backEl  = backRef.current;
        if (!frontEl || !backEl) return;

        const ro = new ResizeObserver(() => {
            // אל תמדוד כאן ישירות! רק תזמן
            scheduleMeasure();
        });
        ro.observe(frontEl);
        ro.observe(backEl);

        return () => ro.disconnect();
    }, [autoHeight, scheduleMeasure]);

    const handleFlip = (to) => { if (flippable) onFlip && onFlip(to); };

    const renderFront = typeof front === "function" ? front({ flip: () => handleFlip(true) }) : front;
    const renderBack  = typeof back  === "function" ? back ({ unflip: () => handleFlip(false) }) : back;

    return (
        <div className={`flip-card ${!flippable ? "no-flip" : ""} ${className}`}>
            <div className={`flip-card-inner ${isFlipped ? "is-flipped" : ""}`} ref={innerRef}>
                <div className="flip-card-face front">
                    <div ref={frontRef} className="card">{renderFront}</div>
                </div>
                <div className="flip-card-face back">
                    <div ref={backRef} className="card">{renderBack}</div>
                </div>
            </div>
        </div>
    );
}
