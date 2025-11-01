// /* ===== LanguageSwitcher.js ===== */

import React from "react";
import {useT} from "../../local/useT"
import FlashButton from "./ButtonGenerate";

export default function LanguageSwitcher({ compact = false, className = "" }) {
    const { lang, setLang, dir } = useT();

    const toggle = () => setLang((prev) => (prev === "en" ? "he" : "en"));

    if (compact) {
        // כפתור אחד (EN ⇄ HE)
        return (
            <div className="tooltip btn--transparent">
            <FlashButton
                type="button"
                className="btn--transparent btn--sm"
                onClick={toggle}
                title={lang === "en" ? "עברית" : "English"}
                aria-label="Change language"
            >
                <span className="tooltiptext fw-600 text-xs">{lang === "en" ? "עברית" : "English"}</span>
                <i className="fa-solid fa-language"></i>

                {/*{lang === "en" ? "HE" : "EN"} • {dir.toUpperCase()}*/}
            </FlashButton>
            </div>
        );
    }

    // שני כפתורים, מסומן הכפתור הפעיל
    return (
        <div className={`btn-container ${className}`}>
            <FlashButton
                type="button"
                className={`btn ${lang === "en" ? "is-success" : ""}`}
                onClick={() => setLang("en")}
            >
                English
            </FlashButton>
                type="button"
                className={`btn ${lang === "he" ? "is-success" : ""}`}
                onClick={() => setLang("he")}
            >
                עברית
        </div>
    );
}
