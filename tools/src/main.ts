#!/usr/bin/env ts-node-esm

// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { defineCommand, runMain } from 'citty';
import capture from './commands/capture.js';

const main = defineCommand({
  meta: {
    name: 'octools',
    version: '1.0.0',
    description: 'Ocelloids development support tools',
  },
  subCommands: {
    capture,
  },
});

runMain(main);