import { mockRxApi } from '@soda/ocelloids-test';
import { blocks } from '../index.js';
import { mongoFilter } from './mongo-filter.js';
import { ControlQuery } from '../subjects/query.js';

describe('control query', () => {
  it('should filter balance transfers', () => {
    blocks()(mockRxApi).pipe(
      mongoFilter(ControlQuery.from({
        'block.extrinsics.call.section': 'balances'
      }))
    ).subscribe(x => console.log(x.toHuman()));
  });
});