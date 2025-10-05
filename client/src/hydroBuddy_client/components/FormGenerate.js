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
    const [values, setValues] = useState(() =>
        fields.reduce((acc, f) => ({ ...acc, [f.name]: initialValues[f.name] ?? "" }), {})
    );
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");

    const handleChange = (name, v) => {
        setValues((s) => ({ ...s, [name]: v }));
        setErrors((e) => ({ ...e, [name]: null }));
    };

    const validateAll = () => {
        const next = {};
        for (const f of fields) {
            if (typeof f.validate === "function") {
                const err = f.validate(values[f.name], values);
                if (err) next[f.name] = err;
            } else { if (f.required && !values[f.name]) next[f.name] = "Required"; }
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
        } finally { setLoading(false); }
    };

    return (
        <Form className={className} onSubmit={handleSubmit} noValidate>
            {fields.map((f) => {
                const val = values[f.name] ?? "";
                const err = errors[f.name];
                if (renderField) {
                    const custom = renderField(f, val, (v) => handleChange(f.name, v), err);
                    if (custom) return <div key={f.name}>{custom}</div>;
                }

                // default renderer
                return (
                    <div key={f.name} style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", marginBottom: 6 }}>{f.label}</label>

                        {f.type === "textarea" ? (
                            <textarea
                                name={f.name}
                                value={val}
                                placeholder={f.placeholder || ""}
                                onChange={(ev) => handleChange(f.name, ev.target.value)}
                                className="input"
                            />
                        ) : f.type === "select" ? (
                            <select
                                name={f.name}
                                value={val}
                                onChange={(ev) => handleChange(f.name, ev.target.value)}
                                className="input"
                            >
                                {(f.options || []).map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                className="input"
                                type={f.type || "text"}
                                name={f.name}
                                value={val}
                                placeholder={f.placeholder || ""}
                                onChange={(ev) => handleChange(f.name, ev.target.value)}
                            />
                        )}

                        {err && <div style={{ color: "salmon", marginTop: 6 }}>{err}</div>}
                    </div>
                );
            })}

            {submitError && <div style={{ color: "salmon", marginBottom: 8 }}>{submitError}</div>}

            <div className="btn-container">
                {
                    customButton ? customButton({ onClick: handleSubmit, loading }) :
                    (<FlashButton onClickAsync={() => handleSubmit()} loading={loading}>{submitLabel}
                </FlashButton>
                    )}
            </div>
        </Form>
    );
}