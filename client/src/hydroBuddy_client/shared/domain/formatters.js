/* ===== formatters.js ===== */

export function validateClient(p) {
    const dateOk = /^\d{2}\/\d{2}\/\d{4}$/.test(p.dateAct);
    const timeOk = /^\d{2}:\d{2}$/.test(p.timeAct);
    const durNum = Number(p.duration);
    const durOk = Number.isInteger(durNum) && durNum > 0;
    return dateOk && timeOk && durOk;
}

// saturday mod
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

// account - joined at
export function formatDateDDMMYYYY(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

export function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("he-IL", {
        day: "2-digit", month: "2-digit", year: "numeric",
        // hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).format(d);
}




