// ToggleSwitch

export default function ToggleSwitch({ checked, onToggle, disabled }) {
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