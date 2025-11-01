// /* ===== useT.js ===== */

import { useLocaleContext } from "./LocaleProvider";

export function useT() {
    const { t, lang, setLang, dir } = useLocaleContext();
    return { t, lang, setLang, dir };
}
