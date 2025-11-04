/* ===== RequestStatus.js ===== */

import { useCallback,useReducer} from "react";

const initialState = { status: "idle", error: null, message: "" };

function reducer(state, action) {
    switch (action.type) {
        case "START":
            return { status: "loading", error: null, message: "" };
        case "SUCCESS":
            return { status: "success", error: null, message: action.message || "" };
        case "ERROR": {
            const err =
                action.error instanceof Error
                    ? action.error
                    : new Error(String(action.error));
            return { status: "error", error: err, message: "" };
        }
        case "RESET":
            return initialState;
        default:
            return state;
    }
}

export function useRequestStatus() {
    const [state, dispatch] = useReducer(reducer, initialState);

    const start = useCallback(() => dispatch({ type: "START" }), []);
    const succeed = useCallback(
        (message) => dispatch({ type: "SUCCESS", message }),
        []
    );
    const fail = useCallback((error) => dispatch({ type: "ERROR", error }), []);
    const reset = useCallback(() => dispatch({ type: "RESET" }), []);

    // נגזרות נוחות לשימוש ב־UI
    const loading = state.status === "loading";
    const ok = state.status === "success";
    const err = state.status === "error" ? (state.error?.message || "Request failed") : "";

    // helper אופציונלי לעטוף פעולה אסינכרונית
    const run = useCallback(
        async (fn, { successMessage } = {}) => {
            start();
            try {
                const result = await fn();
                succeed(successMessage);
                return result;
            } catch (e) {
                fail(e);
                throw e;
            }
        },
        [start, succeed, fail]
    );

    return { ...state, loading, ok, err, start, succeed, fail, reset, run };
}