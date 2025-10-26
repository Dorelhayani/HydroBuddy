// // Card.js
//
// import PropTypes from "prop-types";
// import React, { useCallback, useRef, useState, useEffect } from "react";
//
// export default function Card({
//                                  variant = "",
//                                  header = null,
//                                  footer = null,
//                                  imgsrc = null,
//                                  body = null,
//                                  list = null,
//                                  Link = null,
//                                  button = null,
//                                  title = null,
//                                  text = null,
//                                  children = null,
//                                  className = "",
//                                  onClick = undefined
//                              }) {
//     const borderClass = variant ? `border-${variant}` : "";
//     const textClass = variant ? `text-${variant}` : "";
//
//     return (
//         <div className={`card ${borderClass} ${className}`} onClick={onClick}>
//             {header ? <div className={`card-header ${textClass}`}>{header}</div> : null}
//
//             {imgsrc ? (
//                 <div className="card-body">
//                     <div className="card-img-top">
//                         {typeof imgsrc === "string" ? (
//                             <img src={imgsrc} alt={title || "card-image"}
//                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                                  onClick={onClick}
//                             />) : imgsrc}
//                     </div>
//                 </div>
//             ) : null}
//
//             {(title || text || children || body) ? (
//                 <div className="card-body">
//                     {title && <h5 className={`card-title ${textClass}`}>{title}</h5>}
//                     {text && <p className="card-text">{text}</p>}
//                     {body}
//                     {children}
//                 </div>
//             ) : null}
//
//             {list ? (
//                 <div className="card-body">
//                     <ul className="list-group list-group-flush">
//                         {list}
//                     </ul>
//                 </div>
//             ) : null}
//
//             {(button || Link) ? (
//                 <div className="card-body">
//                     {button ? <div className="card-actions">{button}</div> : null}
//                     {Link ? <div className="Link">{Link}</div> : null}
//                 </div>
//             ) : null}
//
//             {footer ? (
//                 <div className={`card-footer ${textClass}`}>
//                     {typeof footer === "string"
//                         ? <small className="text-body-secondary">{footer}</small>
//                         : footer}
//                 </div>
//             ) : null}
//         </div>
//     );
// }
//
// Card.propTypes = {
//     variant: PropTypes.oneOf(["", "success", "primary", "warning", "danger"]),
//     header: PropTypes.node,
//     footer: PropTypes.node,
//     title: PropTypes.node,
//     text: PropTypes.node,
//     body: PropTypes.node,
//     list: PropTypes.node,
//     link: PropTypes.node,
//     button: PropTypes.node,
//     children: PropTypes.node,
//     className: PropTypes.string,
//     style: PropTypes.object,
//     onClick: PropTypes.func
// };
//
//
//
// export function useBorderFlash(initialVariant = "") {
//     const [variant, setVariant] = useState(initialVariant);
//     const tRef = useRef(null);
//
//     useEffect(() => {
//         return () => clearTimeout(tRef.current);
//     }, []);
//
//     const flash = useCallback((v, ms = 2000) => {
//         clearTimeout(tRef.current);
//         setVariant(v);
//         if (ms && ms > 0) {
//             tRef.current = setTimeout(() => {
//                 setVariant(""); // מוחק לאחר הזמן (אפשר לשנות לשימור של initialVariant)
//             }, ms);
//         }
//     }, []);
//
//     const flashSuccess = useCallback((ms = 2000) => flash("success", ms), [flash]);
//     const flashPrimary = useCallback((ms = 2000) => flash("primary", ms), [flash]);
//     const flashWarning = useCallback((ms = 2000) => flash("warning", ms), [flash]);
//     const flashDanger = useCallback((ms = 2000) => flash("danger", ms), [flash]);
//     const flashCustom = useCallback((v = "", ms = 2000) => flash(v, ms), [flash]);
//
//     return { variant, setVariant, flashSuccess, flashPrimary, flashWarning, flashDanger, flashCustom };
// }




// Card.js

import PropTypes from "prop-types";
import React, { useCallback, useRef, useState, useEffect } from "react";

export default function Card({
                                 variant = "",
                                 header = null,
                                 footer = null,
                                 imgsrc = null,
                                 body = null,
                                 list = null,
                                 Link = null,
                                 button = null,
                                 title = null,
                                 text = null,
                                 children = null,
                                 className = "",
                                 onClick = undefined,
                                 style = undefined,
                                 listClassName = "",
                                 headerClassName = "",
                                 bodyClassName = "",
                                 footerClassName = "",
                             }) {
    const borderClass = variant ? `border-${variant}` : "";
    const textClass = variant ? `text-${variant}` : "";

    return (
            <div className={`card ${borderClass} ${className}`} onClick={onClick} style={style}>
                {header ? <div className={`card-header ${textClass} ${headerClassName}`}>{header}</div> : null}

            {imgsrc ? (
                <div className={`card-body ${bodyClassName}`}>
                    <div className="card-img-top">
                        {typeof imgsrc === "string" ? (
                            <img src={imgsrc} alt={title || "card-image"}
                                 style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                 onClick={onClick}
                            />) : imgsrc}
                    </div>
                </div>
            ) : null}

            {(title || text || children || body) ? (
                <div className={`card-body ${bodyClassName}`}>
                    {title && <h5 className={`card-title ${textClass}`}>{title}</h5>}
                    {text && <p className="card-text">{text}</p>}
                    {body}
                    {children}
                </div>
            ) : null}

            {list ? (
                <div className={`card-body ${bodyClassName}`}>
                    <ul className="list-group list-group-flush">
                        {list}
                    </ul>
                </div>
            ) : null}

            {(button || Link) ? (
                <div className={`card-body ${bodyClassName}`}>
                    {button ? <div className="card-actions">{button}</div> : null}
                    {Link ? <div className="Link">{Link}</div> : null}
                </div>
            ) : null}

            {footer ? (
                <div className={`card-footer ${textClass} ${footerClassName}`}>
                    {typeof footer === "string"
                        ? <small className="text-body-secondary">{footer}</small>
                        : footer}
                </div>
            ) : null}
        </div>
    );
}

Card.propTypes = {
    variant: PropTypes.oneOf(["", "success", "primary", "warning", "danger"]),
    header: PropTypes.node,
    footer: PropTypes.node,
    title: PropTypes.node,
    text: PropTypes.node,
    body: PropTypes.node,
    list: PropTypes.node,
    link: PropTypes.node,
    button: PropTypes.node,
    children: PropTypes.node,
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
    headerClassName: PropTypes.string,
    bodyClassName: PropTypes.string,
    footerClassName: PropTypes.string,
};



export function useBorderFlash(initialVariant = "") {
    const [variant, setVariant] = useState(initialVariant);
    const tRef = useRef(null);

    useEffect(() => {
        return () => clearTimeout(tRef.current);
    }, []);

    const flash = useCallback((v, ms = 2000) => {
        clearTimeout(tRef.current);
        setVariant(v);
        if (ms && ms > 0) {
            tRef.current = setTimeout(() => {
                setVariant(""); // מוחק לאחר הזמן (אפשר לשנות לשימור של initialVariant)
            }, ms);
        }
    }, []);

    const flashSuccess = useCallback((ms = 2000) => flash("success", ms), [flash]);
    const flashPrimary = useCallback((ms = 2000) => flash("primary", ms), [flash]);
    const flashWarning = useCallback((ms = 2000) => flash("warning", ms), [flash]);
    const flashDanger = useCallback((ms = 2000) => flash("danger", ms), [flash]);
    const flashCustom = useCallback((v = "", ms = 2000) => flash(v, ms), [flash]);

    return { variant, setVariant, flashSuccess, flashPrimary, flashWarning, flashDanger, flashCustom };
}