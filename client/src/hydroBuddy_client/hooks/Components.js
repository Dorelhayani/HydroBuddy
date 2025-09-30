import { useState, useCallback, useRef, useEffect } from "react";

export function useFlashButton(ms = 3000) {
    const [cooling, setCooling] = useState(false);   // נעילה ל־3ש'
    const [success, setSuccess] = useState(false);   // צבע ירוק
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

export function FlashButton({ onClickAsync, loading, children, className = "", ms = 3000 }) {
    const { cooling, success, flash } = useFlashButton(ms);

    const handleClick = async (e) => {
        e?.preventDefault?.();
        try {
            await onClickAsync();
            flash();
        } catch (e) { }
    };
    return (
        <button
            type="button"
            className={`btn ${success ? "is-success" : ""} ${className}`}
            onClick={handleClick}
            disabled={loading || cooling}
        >
            {loading ? "Saving…" : success ? "Saved!" : children}
        </button>
    );
}

