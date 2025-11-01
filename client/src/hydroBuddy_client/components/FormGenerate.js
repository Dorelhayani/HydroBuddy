/* ===== FormGenerate.js ===== */

import React, { useState } from "react";
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
                                        rowClassNameAll = "",
                                        labelClassNameAll = "",
                                        inputClassNameAll = "",
                                        placeholderClassAll = "",
}) {
    // נרמול ערכי פתיחה
    const normalizeInit = (fs, iv) =>
        fs.reduce((acc, f) => {
            const init = iv[f.name];
            if (f.type === "select" && f.multiple) {
                acc[f.name] = Array.isArray(init) ? init : init != null ? [init] : [];
            } else if (f.type === "checkbox") {
                acc[f.name] = Boolean(init);
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
        if (val === "" || val == null) return "";
        const n = Number(val);
        return Number.isFinite(n) ? n : val;
    };

    const validateAll = () => {
        const next = {};
        for (const f of fields) {
            const val = values[f.name];
            if (typeof f.validate === "function") {
                const err = f.validate(val, values);
                if (err) next[f.name] = err;
            } else if (f.required) {
                if (f.type === "select" && !f.multiple) {
                    if (val === "" || val == null) next[f.name] = "Required";
                } else if (f.type === "select" && f.multiple) {
                    if (!Array.isArray(val) || val.length === 0) next[f.name] = "Required";
                } else if (f.type === "checkbox") {
                    if (!val) next[f.name] = "Required";
                } else {
                    if (!val && val !== 0) next[f.name] = "Required";
                }
            }
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
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

    // נרמול אופציות ל־{ value, label }
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

    // עוזר לאיידים ו־aria
    const fid = (f) => f.id || `f_${f.name}`;
    const errId = (f) => `err_${f.name}`;
    const helpId = (f) => (f.help ? `help_${f.name}` : undefined);

    return (
        <Form
            className={["form", "stack-12", className].filter(Boolean).join(" ")}
            onSubmit={handleSubmit}
            noValidate
        >
            {fields.map((f) => {
                const val = values[f.name] ?? (f.multiple ? [] : f.type === "checkbox" ? false : "");
                const err = errors[f.name];
                const fieldId = fid(f);

                // רנדרר מותאם (אם סופק)
                if (renderField) {
                    const custom = renderField(f, val, (v) => handleChange(f.name, v), err);
                    if (custom) return <div key={f.name}>{custom}</div>;
                }

                // בלוק אחיד לשדה
                const block = (control) => (
                    <div key={f.name} className={`form-row ${rowClassNameAll} ${f.rowClassName || ""} ${err ? "has-error" : ""}`}>
                        {f.type !== "checkbox" && (
                            <label className={`form-label ${labelClassNameAll} ${f.labelClassName || ""}`} htmlFor={fieldId}>
                                {f.label || f.placeholder}
                                {f.required ? <span className="form-req" aria-hidden="true"></span> : null}
                            </label>
                        )}

                        {control}

                        {f.help && (
                            <div id={helpId(f)} className="form-help text-subtle">
                                {f.help}
                            </div>
                        )}

                        {err && (
                            <div id={errId(f)} className="form-error" role="alert">
                                {err}
                            </div>
                        )}
                    </div>
                );

                // checkbox (layout שונה)
                if (f.type === "checkbox") {
                    return (
                        <div key={f.name} className={`form-row form-row--check ${err ? "has-error" : ""}`}>
                            <label className="check">
                                <input
                                    id={fieldId}
                                    type="checkbox"
                                    checked={!!val}
                                    onChange={(ev) => handleChange(f.name, ev.target.checked)}
                                    aria-describedby={[helpId(f), err ? errId(f) : null].filter(Boolean).join(" ") || undefined}
                                    aria-invalid={!!err}
                                />
                                <span className="check__label">
                  {f.label || f.placeholder}
                                    {f.required ? <span className="form-req" aria-hidden="true"></span> : null}
                </span>
                            </label>
                            {f.help && <div id={helpId(f)} className="form-help text-subtle">{f.help}</div>}
                            {err && <div id={errId(f)} className="form-error" role="alert">{err}</div>}
                        </div>
                    );
                }

                if (f.type === "textarea") {
                    return block(
                        <textarea
                            id={fieldId}
                            name={f.name}
                            rows={f.rows || 4}
                            value={val}
                            placeholder={f.placeholder || ""}
                            onChange={(ev) => handleChange(f.name, ev.target.value)}
                            className={`input ${inputClassNameAll} ${f.inputClassName || ""} ${placeholderClassAll} ${f.placeholderClass || ""}`}
                            aria-describedby={[helpId(f), err ? errId(f) : null].filter(Boolean).join(" ") || undefined}
                            aria-invalid={!!err}
                        />
                    );
                }

                if (f.type === "select") {
                    const rawOptions = typeof f.getOptions === "function" ? f.getOptions(values) : f.options;
                    const opts = toOptionTuples(rawOptions || [], { valueKey: f.valueKey, labelKey: f.labelKey });
                    const disabledSet = new Set(f.disabledOptions || []);

                    const showPlaceholder = !f.multiple && f.placeholderOption;
                    const placeholder = showPlaceholder
                        ? [{ value: "", label: typeof f.placeholderOption === "string" ? f.placeholderOption : "— Select —" }]
                        : [];

                    const selectValue = f.multiple ? (Array.isArray(val) ? val.map(String) : []) : String(val ?? "");
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
                            id={fieldId}
                            name={f.name}
                            value={selectValue}
                            onChange={onSelectChange}
                            className={`input ${f.inputClassName || ""} ${f.placeholderClass || ""}`}
                            multiple={!!f.multiple}
                            aria-describedby={[helpId(f), err ? errId(f) : null].filter(Boolean).join(" ") || undefined}
                            aria-invalid={!!err}
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
                        id={fieldId}
                        className={`input ${f.inputClassName || ""} ${f.placeholderClass || ""}`}
                        type={f.type || "text"}
                        name={f.name}
                        value={val}
                        placeholder={f.placeholder || ""}
                        onChange={(ev) => {
                            const next = f.asNumber ? coerce(ev.target.value, true) : ev.target.value;
                            handleChange(f.name, next);
                        }}
                        autoComplete={f.autoComplete}
                        aria-describedby={[helpId(f), err ? errId(f) : null].filter(Boolean).join(" ") || undefined}
                        aria-invalid={!!err}
                    />
                );
            })}

            {submitError && <div className="form-error" role="alert">{submitError}</div>}

            <div className="btn-container">
                {customButton ? (
                    customButton({ onClick: handleSubmit, loading })
                ) : (
                    <FlashButton
                        className="btn btn--primary btn--block"
                        onClickAsync={() => handleSubmit()}
                        loading={loading}
                    >
                        {submitLabel}
                    </FlashButton>
                )}
            </div>
        </Form>
    );
}
