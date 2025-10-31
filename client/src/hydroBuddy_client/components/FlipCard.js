/* ===== FlipCard.js ===== */

import React from "react";
import PropTypes from "prop-types";

export default function FlipCard({
                                     front,
                                     back,
                                     flippable = true,
                                     isFlipped,
                                     onFlip,
                                     autoHeight = false,
                                     defaultFlipped = false,
                                     className = "",
                                     style = {},
                                     innerClassName = "",
                                     frontClassName = "",
                                     backClassName = "",
                                     transitionDuration = "0.6s",
                                     axis = "Y",
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
                        ? front({ flip: () => setFlipped(true) }) : front}
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



