// FlipCard.js

import React from "react";
export default function FlipCard({
                                     front,
                                     back,
                                     flippable = true,
                                     isFlipped,            // optional (controlled)
                                     onFlip,               // optional (controlled)
                                     autoHeight = false,
                                     defaultFlipped = false,
                                     className = "",
                                     style,
                                     ...rest
                                 }) {
    const [innerFlipped, setInnerFlipped] = React.useState(defaultFlipped);
    const flipped = isFlipped !== undefined ? isFlipped : innerFlipped;

    const setFlipped = (v) => {
        if (!flippable) return;
        if (onFlip) onFlip(v);
        else setInnerFlipped(v);
    };

    return (
        <div
            className={`flip-card ${flippable ? "" : "no-flip"} ${className}`}
            style={style}
            {...rest}
        >
            <div className={`flip-card-inner ${flipped ? "is-flipped" : ""}`}>
                <div className="flip-card-face front">
                    {/* הצד הקדמי מקבל פונקציה flip כדי שתוכל לשים כפתור "Actions" */}
                    {typeof front === "function" ? front({ flip: () => setFlipped(true) }) : front}
                </div>
                <div className="flip-card-face back">
                    {/* הצד האחורי מקבל פונקציה unflip כדי לשים "Back" */}
                    {typeof back === "function" ? back({ unflip: () => setFlipped(false) }) : back}
                </div>
            </div>
        </div>
    );
}