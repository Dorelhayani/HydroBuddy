import React, { useState, useMemo, useCallback } from "react";
export default function ClickableList({
                                          items = [],
                                          renderItem,
                                          onItemClick,
                                          className = "",
                                          itemKey = (item, i) => i,
                                          selected,
                                          onChangeSelected,
                                          getDisabled = () => false,
                                          loading = false,
                                          error = null,
                                          emptyContent = "No items",
                                          ariaLabel = "Clickable list",
                                          count,
                                      }) {
    const [internalSelected, setInternalSelected] = useState(null);
    const isControlled = typeof selected !== "undefined";
    const currentSelected = isControlled ? selected : internalSelected;

    const keyGetter = useMemo(() => {
        if (typeof itemKey === "string") return (item) => item?.[itemKey];
        return itemKey;
    }, [itemKey]);

    const handleSelect = useCallback((item) => {
        if (!isControlled) setInternalSelected(item);
        onChangeSelected && onChangeSelected(item);
        onItemClick && onItemClick(item);
    }, [isControlled, onChangeSelected, onItemClick]);

    if (loading) {
        return (
            <ul className={`c-list c-list--loading ${className}`} aria-label={ariaLabel}>
                <li className="c-list__loading">Loading…</li>
            </ul>
        );
    }

    if (error) {
        return (
            <ul className={`c-list c-list--error ${className}`} aria-label={ariaLabel}>
                <li className="c-list__error" role="alert">{String(error)}</li>
            </ul>
        );
    }

    if (!items || items.length === 0) {
        return (
            <ul className={`c-list c-list--empty ${className}`} aria-label={ariaLabel}>
                <li className="c-list__empty">{emptyContent}</li>
            </ul>
        );
    }

    return (
        <div className={`c-list__wrapper ${className}`}>
            <ul className="c-list" role="listbox" aria-label={ariaLabel}>
                {items.map((item, index) => {
                    const key = keyGetter(item, index);
                    const disabled = !!getDisabled(item);
                    const isSelected =
                        currentSelected &&
                        (currentSelected === item ||
                            key === (typeof itemKey === "string" ? currentSelected?.[itemKey] : keyGetter(currentSelected, index)));

                    return (
                        <li
                            key={key}
                            role="option"
                            aria-selected={!!isSelected}
                            tabIndex={disabled ? -1 : 0}
                            className={[
                                "c-list__item",
                                isSelected ? "is-selected" : "",
                                disabled ? "is-disabled" : "",
                            ].join(" ").trim()}
                            onClick={() => !disabled && handleSelect(item)}
                            onKeyDown={(e) => {
                                if (disabled) return;
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handleSelect(item);
                                }
                            }}
                        >
                            {renderItem ? renderItem(item) : <span className="c-list__label">{String(item)}</span>}
                        </li>
                    );
                })}
            </ul>

            {typeof count === "number" && count >= 0 && (
                <div className="c-list__meta">
                    Showing <strong>{items.length}</strong>{count !== items.length ? ` of ${count}` : ""} items
                </div>
            )}
        </div>
    );
}
