import React, {useState, useCallback, useRef, useEffect } from "react";

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

export default function FlashButton({ onClickAsync, loading = false, children, className = "", ms = 2000, ...rest }) {
    const { cooling, success, flash } = useFlashButton(ms);

    const handleClick = async (e) => {
        e?.preventDefault?.();
        if (loading || cooling) return;
        try {
            await onClickAsync();
            flash();
        } catch (err) {}
    };

    return (
        <button
            type="button"
            className={`btn ${success ? "is-success" : ""} ${className}`}
            onClick={handleClick}
            disabled={loading || cooling}
            {...rest}
        >
            {loading ? "Saving…" : success ? "Saved!" : children}
        </button>
    );
}