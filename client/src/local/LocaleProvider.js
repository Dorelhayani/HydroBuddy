// /* ===== LocaleProvider.js ===== */

import React from "react";

import { createTranslator, DEFAULT_LANG, isRTL, supportedLangs } from "../i18n/i18n";

const LocaleContext = React.createContext(null);

export function LocaleProvider({ initial = null, children }) {
    const [lang, setLang] = React.useState(() => {

        const url = new URL(window.location.href);
        const fromQuery = url.searchParams.get("lang");
        const saved = window.localStorage.getItem("lang");
        const candidate = fromQuery || saved || DEFAULT_LANG;
        return supportedLangs().includes(candidate) ? candidate : DEFAULT_LANG;
    });

    const value = React.useMemo(() => {
        const { t } = createTranslator(lang);
        return { lang, setLang, t, dir: isRTL(lang) ? "rtl" : "ltr" };
    }, [lang]);

    React.useEffect(() => {
        document.documentElement.setAttribute("lang", value.lang);
        document.documentElement.setAttribute("dir", value.dir);
        document.documentElement.classList.toggle("rtl", value.dir === "rtl");
        document.documentElement.classList.toggle("rtl", value.dir === "rtl");
        document.documentElement.classList.toggle("ltr", value.dir === "ltr");
        document.documentElement.classList.toggle("is-rtl", value.dir === "rtl");
        document.documentElement.classList.toggle("is-ltr", value.dir === "ltr");
        document.documentElement.setAttribute("data-dir", value.dir);
        document.body.classList.toggle("rtl", value.dir === "rtl");
        document.body.classList.toggle("ltr", value.dir === "ltr");
        document.body.classList.toggle("is-rtl", value.dir === "rtl");
        document.body.classList.toggle("is-ltr", value.dir === "ltr");
        document.body.setAttribute("data-dir", value.dir);
        window.localStorage.setItem("lang", value.lang);
    }, [value.lang, value.dir]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
    const ctx = React.useContext(LocaleContext);
    if (!ctx) throw new Error("useLocaleContext must be used within <LocaleProvider>");
    return ctx;
}
