/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
