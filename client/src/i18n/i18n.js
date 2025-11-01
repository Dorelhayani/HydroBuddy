// /* ===== i18n.js ===== */

import en from "./en.json";
import he from "./he.json";

const DICTS = { en, he };
export const DEFAULT_LANG = "en";

function getByPath(obj, path) {
    return path.split(".").reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), obj);
}


function interpolate(str, params) {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, k) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function createTranslator(lang) {
    const dict = DICTS[lang] || DICTS[DEFAULT_LANG];
    const t = (key, params) => {
        const raw = getByPath(dict, key) ?? key; // fallback: מציג את המפתח עצמו
        return typeof raw === "string" ? interpolate(raw, params) : raw;
    };
    return { t, dict };
}

export function isRTL(lang) { return lang === "he"; }

export function supportedLangs() {
    return Object.keys(DICTS); // ["en","he"]
}
