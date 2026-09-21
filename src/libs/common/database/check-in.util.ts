export function checkIn(column: string, values: readonly string[]): string {
  const list = values.map((value) => `'${value}'`).join(", ");
  return `"${column}" IN (${list})`;
}

export function checkName(table: string, column: string): string {
  return `CHK_${table}_${column}`;
}
