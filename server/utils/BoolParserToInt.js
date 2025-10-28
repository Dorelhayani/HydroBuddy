/* ===== toInt01.js ===== */

function toInt01(v) {
    if (v === 1 || v === '1') return 1;
    if (v === 0 || v === '0') return 0;

    if (v === true || v === 'true' || v === 'TRUE') return 1;
    if (v === false || v === 'false' || v === 'FALSE' || v == null || v === '') return 0;
    const n = Number(v);
    if (Number.isFinite(n)) return n ? 1 : 0;
    return 0;
}
module.exports = { toInt01 };