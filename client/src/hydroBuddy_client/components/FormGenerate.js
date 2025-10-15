// FormGenerate.js

import React, {useState} from "react";
import { Form } from "react-router-dom";
import FlashButton from "./ButtonGenerate";

export default function GenericForm({
                                        fields = [],
                                        initialValues = {},
                                        onSubmit,
                                        submitLabel = "Save",
                                        renderField,
                                        className = "",
                                        customButton,
                                    }) {
    const normalizeInit = (fs, iv) =>
        fs.reduce((acc, f) => {
            const init = iv[f.name];
            // לשדה multiple נאתחל למערך
            if (f.type === "select" && f.multiple) {
                acc[f.name] = Array.isArray(init) ? init : (init != null ? [init] : []);
            } else {
                acc[f.name] = init ?? "";
            }
            return acc;
        }, {});

    const [values, setValues] = useState(() => normalizeInit(fields, initialValues));
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (name, v) => {
        setValues((s) => ({ ...s, [name]: v }));
        setErrors((e) => ({ ...e, [name]: null }));
    };

    const coerce = (val, asNumber) => {
        if (!asNumber) return val;
        if (val === "" || val === null || val === undefined) return "";
        const n = Number(val);
        return Number.isFinite(n) ? n : val; // אם לא מספר תקין, נשאיר כפי שהוא
    };

    const validateAll = () => {
        const next = {};
        for (const f of fields) {
            const val = values[f.name];
            if (typeof f.validate === "function") {
                const err = f.validate(val, values);
                if (err) next[f.name] = err;
            } else if (f.required) {
                // עבור select עם placeholder ריק
                if (f.type === "select" && !f.multiple) {
                    if (val === "" || val === null || val === undefined) next[f.name] = "Required";
                } else if (f.type === "select" && f.multiple) {
                    if (!Array.isArray(val) || val.length === 0) next[f.name] = "Required";
                } else {
                    if (!val && val !== 0) next[f.name] = "Required";
                }
            }
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSubmitError("");
        if (!validateAll()) return;
        try {
            setLoading(true);
            await onSubmit(values);
        } catch (err) {
            setSubmitError(err.message || "Submit failed");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // עוזר לנרמל אופציות ל־{ value, label }
    const toOptionTuples = (options, { valueKey, labelKey } = {}) => {
        if (!options) return [];
        return options.map((opt) => {
            if (typeof opt === "string" || typeof opt === "number") {
                return { value: String(opt), label: String(opt) };
            }
            if (opt && typeof opt === "object") {
                const v = valueKey ? opt[valueKey] : opt.value;
                const l = labelKey ? opt[labelKey] : opt.label;
                return { value: String(v), label: String(l) };
            }
            return { value: "", label: String(opt) };
        });
    };

    return (
        <Form className={className} onSubmit={handleSubmit} noValidate>
            {fields.map((f) => {
                const val = values[f.name] ?? (f.multiple ? [] : "");
                const err = errors[f.name];

                // מאפשר רנדרר מותאם
                if (renderField) {
                    const custom = renderField(f, val, (v) => handleChange(f.name, v), err);
                    if (custom) return <div key={f.name}>{custom}</div>;
                }

                // ברירת מחדל
                const block = (child) => (
                    <div key={f.name} style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>{f.label}</label>
                        {child}
                        {err && <div style={{ color: "salmon", marginTop: 6 }}>{err}</div>}
                    </div>
                );

                if (f.type === "textarea") {
                    return block(
                        <textarea
                            name={f.name}
                            value={val}
                            placeholder={f.placeholder || ""}
                            onChange={(ev) => handleChange(f.name, ev.target.value)}
                            className="input"
                        />
                    );
                }

                if (f.type === "select") {
                    // אופציות יכולות להגיע ישירות או מפונקציה דינמית
                    const rawOptions = typeof f.getOptions === "function" ? f.getOptions(values) : f.options;
                    const opts = toOptionTuples(rawOptions || [], { valueKey: f.valueKey, labelKey: f.labelKey });
                    const disabledSet = new Set(f.disabledOptions || []);

                    // placeholderOption – יצירת בחירה ריקה למצב single
                    const showPlaceholder = !f.multiple && f.placeholderOption;
                    const placeholder = showPlaceholder
                        ? [{ value: "", label: typeof f.placeholderOption === "string" ? f.placeholderOption : "— Select —" }]
                        : [];

                    const selectValue = f.multiple
                        ? (Array.isArray(val) ? val.map(String) : [])
                        : String(val ?? "");

                    const onSelectChange = (ev) => {
                        if (f.multiple) {
                            const chosen = Array.from(ev.target.selectedOptions).map((o) => o.value);
                            handleChange(f.name, f.asNumber ? chosen.map((x) => coerce(x, true)) : chosen);
                        } else {
                            const v = ev.target.value;
                            handleChange(f.name, coerce(v, f.asNumber));
                        }
                    };

                    return block(
                        <select
                            name={f.name}
                            value={selectValue}
                            onChange={onSelectChange}
                            className="input"
                            multiple={!!f.multiple}
                        >
                            {placeholder.map((p) => (
                                <option key="__placeholder__" value="">
                                    {p.label}
                                </option>
                            ))}
                            {opts.map((opt) => (
                                <option key={opt.value} value={opt.value} disabled={disabledSet.has(opt.value)}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    );
                }

                // input רגיל
                return block(
                    <input
                        className="input"
                        type={f.type || "text"}
                        name={f.name}
                        value={val}
                        placeholder={f.placeholder || ""}
                        onChange={(ev) => {
                            const next = f.asNumber ? coerce(ev.target.value, true) : ev.target.value;
                            handleChange(f.name, next);
                        }}
                    />
                );
            })}

            {submitError && <div style={{ color: "salmon", marginBottom: 8 }}>{submitError}</div>}

            <div className="btn-container">
                {customButton
                    ? customButton({ onClick: handleSubmit, loading })
                    : (
                        <FlashButton onClickAsync={() => handleSubmit()} loading={loading}>
                            {submitLabel}
                        </FlashButton>
                    )}
            </div>
        </Form>
    );
}
