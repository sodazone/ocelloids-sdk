import type { SignedBlockExtended } from '@polkadot/api-derive/types';

import { Observable, concatMap, share } from 'rxjs';

export function extractExtrinsics() {
  return (source: Observable<SignedBlockExtended>) => {
    return (source.pipe(
      concatMap(block => block.extrinsics),
      share()
    ));
  };
}

export function extractEvents() {
  return (source: Observable<SignedBlockExtended>) => {
    return (source.pipe(
      concatMap(block => block.events),
      share()
    ));
  };
}