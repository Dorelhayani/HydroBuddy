
export function validateClient(p) {
    const dateOk = /^\d{2}\/\d{2}\/\d{4}$/.test(p.dateAct);
    const timeOk = /^\d{2}:\d{2}$/.test(p.timeAct);
    const durNum = Number(p.duration);
    const durOk = Number.isInteger(durNum) && durNum > 0;
    return dateOk && timeOk && durOk;
}

export function toInputDate(ddmmyyyy) {
    if (!ddmmyyyy) return "";
    const [d, m, y] = ddmmyyyy.split("/");
    if (!d || !m || !y) return "";
    return `${y}-${m.padStart(2,"0")}-${d.padStart(2,"0")}`;
}

export function toServerDate(yyyy_mm_dd) {
    if (!yyyy_mm_dd) return "";
    const [y, m, d] = yyyy_mm_dd.split("-");
    if (!y || !m || !d) return "";
    return `${d.padStart(2,"0")}/${m.padStart(2,"0")}/${y}`;
}

export function ToggleSwitch({ checked, onToggle, disabled }) {
    const handleClick = () => {
        if (!disabled) onToggle(!checked);
    };

    const handleKeyDown = (e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(!checked);
        }
    };

    return (
        <div className="toggle" role="switch" aria-checked={checked} aria-disabled={disabled || undefined}
             tabIndex={disabled ? -1 : 0} onClick={handleClick} onKeyDown={handleKeyDown}>
            <div className="knob" />
        </div>
    );
}


