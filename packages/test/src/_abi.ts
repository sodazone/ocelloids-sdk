import * as path from 'node:path';
import { readFileSync } from 'node:fs';

export function testAbiFrom(file: string) {
  const buffer = readFileSync(path.resolve(__dirname, '__data__/abi', file));
  return buffer.toString();
}