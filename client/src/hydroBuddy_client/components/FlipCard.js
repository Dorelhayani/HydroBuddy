// // FlipCard.js
//
// import React from "react";
// export default function FlipCard({
//                                      front,
//                                      back,
//                                      flippable = true,
//                                      isFlipped,            // optional (controlled)
//                                      onFlip,               // optional (controlled)
//                                      autoHeight = false,
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
import PropTypes from "prop-types";

export default function FlipCard({
                                     front,
                                     back,
                                     flippable = true,
                                     isFlipped,               // מצב חיצוני (controlled)
                                     onFlip,                  // callback חיצוני
                                     autoHeight = false,
                                     defaultFlipped = false,
                                     className = "",
                                     style = {},
                                     innerClassName = "",
                                     frontClassName = "",
                                     backClassName = "",
                                     transitionDuration = "0.6s", // חדש: מהירות מעבר
                                     axis = "Y",                  // חדש: כיוון הציר (Y או X)
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
            <div
                className={`flip-card-inner ${innerClassName} ${flipped ? "is-flipped" : ""}`}
                style={{
                    transition: `transform ${transitionDuration} ease`,
                    transformStyle: "preserve-3d",
                    ...(axis === "X" ? { transformOrigin: "center left" } : {}),
                }}
            >
                <div
                    className={`flip-card-face front ${frontClassName}`}
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                    }}
                >
                    {typeof front === "function"
                        ? front({ flip: () => setFlipped(true) })
                        : front}
                </div>

                <div
                    className={`flip-card-face back ${backClassName}`}
                    style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: axis === "X" ? "rotateX(180deg)" : "rotateY(180deg)",
                    }}
                >
                    {typeof back === "function"
                        ? back({ unflip: () => setFlipped(false) })
                        : back}
                </div>
            </div>
        </div>
    );
}

FlipCard.propTypes = {
    front: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    back: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    flippable: PropTypes.bool,
    isFlipped: PropTypes.bool,
    onFlip: PropTypes.func,
    autoHeight: PropTypes.bool,
    defaultFlipped: PropTypes.bool,
    className: PropTypes.string,
    innerClassName: PropTypes.string,
    frontClassName: PropTypes.string,
    backClassName: PropTypes.string,
    style: PropTypes.object,
    transitionDuration: PropTypes.string,
    axis: PropTypes.oneOf(["X", "Y"]),
};



