// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import * as path from 'node:path';
import { readFileSync } from 'node:fs';

export function testMetadataFrom(file: string) {
  const buffer = readFileSync(path.resolve(__dirname, '__data__/abi', file));
  return buffer.toString();
}