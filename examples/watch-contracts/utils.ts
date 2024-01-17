// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

export function printHeader(text, char, length) {
  const sep = `> ${char.repeat(length)}`;
  console.log(sep);
  console.log(text);
  console.log(sep);
}
export function objectToStructuredString(data, level = 0): string {
  if (data === undefined || data === null) {
    return 'null';
  }
  if (typeof data === 'string' || Object.keys(data).length === 0) {
    return data;
  }
  return Object.keys(data).map(k => `\n>${' '.repeat(level * 2)} - ${k}: ${objectToStructuredString(data[k], level + 1)}`).join('');
}
