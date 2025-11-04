// ButtonGenerate.js

import { useCallback, useEffect,useRef, useState } from "react";

export function useFlashButton(ms = 3000) {
    const [cooling, setCooling] = useState(false);
    const [success, setSuccess] = useState(false);
    const tRef = useRef(null);

    const flash = useCallback(() => {
        setSuccess(true);
        setCooling(true);
        clearTimeout(tRef.current);
        tRef.current = setTimeout(() => {
            setSuccess(false);
            setCooling(false);
        }, ms);
    }, [ms]);

    useEffect(() => () => clearTimeout(tRef.current), []);
    return { cooling, success, flash };
}

export default function FlashButton({
                                        onClickAsync,
                                        loading = false,
                                        children,
                                        className = "",
                                        variant = "primary",   // primary / ghost / outline / danger / success
                                        size = "md",           // sm / md / lg
                                        block = false,         // למלא רוחב
                                        icon = false,          // אם זה אייקון בלבד
                                        ms = 2000,
                                        ...rest
                                    }) {
    const { cooling, success, flash } = useFlashButton(ms);

    const handleClick = async (e) => {
        e?.preventDefault?.();
        if (loading || cooling) return;
        try {
            await onClickAsync?.();
            flash();
        } catch (err) { }
    };

    const baseClasses = [
        "btn",
        `btn--${variant}`,
        size !== "md" ? `btn--${size}` : "",
        block ? "btn--block" : "",
        icon ? "btn--icon" : "",
        success ? "is-success" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type="button"
            className={baseClasses}
            onClick={handleClick}
            disabled={loading || cooling}
            {...rest}
        >
            {loading
                ? "Saving…"
                : success
                    ? "Saved!"
                    : children}
        </button>
    );
}
