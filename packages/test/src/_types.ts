// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

export type BinBlock = {
  block: Uint8Array;
  events: Uint8Array[];
  author?: Uint8Array;
};
