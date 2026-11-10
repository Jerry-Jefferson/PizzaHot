export function checkIn(column, values) {
    const list = values.map((value) => `'${value}'`).join(", ");
    return `"${column}" IN (${list})`;
}
export function checkName(table, column) {
    return `CHK_${table}_${column}`;
}
//# sourceMappingURL=check-in.util.js.map