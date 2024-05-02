// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { WellKnownChain } from '@substrate/connect';

import { createScClient } from './smoldot.js';

export const Smoldot = {
  createScClient,
  WellKnownChain: WellKnownChain,
};
