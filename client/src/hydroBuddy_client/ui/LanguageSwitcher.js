/* ===== LanguageSwitcher.js ===== */

import {useT} from "../../local/useT"
import FlashButton from "./ButtonGenerate";

export default function LanguageSwitcher({ compact = false, className = "" }) {
    const { lang, setLang } = useT();
    const toggle = () => setLang((prev) => (prev === "en" ? "he" : "en"));

    if (compact) {
        return (
            <div className="tooltip btn--transparent nudge-r-800">
                <FlashButton
                    type="button"
                    className="btn--transparent btn--sm"
                    onClick={toggle}
                    title={lang === "en" ? "עברית" : "English"}
                    aria-label="Change language"
                >
                    <span className="tooltiptext fw-600 text-xs">{lang === "en" ? "עברית" : "English"}</span>
                    {/*<i className="fa-solid fa-language fa-flip"></i>*/}
                    <i className="fa-solid fa-globe fa-flip"></i>
                </FlashButton>
            </div>
        );
    }

    return (
        <div className={`btn-container ${className}`}>
            <FlashButton
                type="button" className={`btn ${lang === "en" ? "is-success" : ""}`}
                onClick={() => setLang("en")} > English </FlashButton>

            <FlashButton
                type="button"
                className={`btn ${lang === "he" ? "is-success" : ""}`}
                onClick={() => setLang("he")}>עברית</FlashButton>
        </div>
    );
}
