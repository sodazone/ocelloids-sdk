#!/usr/bin/env node

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