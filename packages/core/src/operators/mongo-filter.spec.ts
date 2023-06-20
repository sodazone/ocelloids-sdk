import { mockRxApi } from '@sodazone/ocelloids-test';
import { blocks } from '../index.js';
import { mongoFilter, mongoFilterFrom } from './mongo-filter.js';
import { ControlQuery } from '../subjects/query.js';

describe('control query', () => {
  it('should filter all non matching blocks', () => {
    const found = jest.fn();

    blocks()(mockRxApi).pipe(
      mongoFilter(ControlQuery.from({
        'block.extrinsics.call.section': 'nope',
        'block.extrinsics.call.method': 'nope'
      }))
    ).subscribe(found);

    expect(found).not.toBeCalled;
  });

  it('should filter balance transfers', () => {
    const found = jest.fn();

    blocks()(mockRxApi).pipe(
      mongoFilter(ControlQuery.from({
        'block.extrinsics.call.section': 'balances',
        'block.extrinsics.call.method': 'transferKeepAlive'
      }))
    ).subscribe(found);

    expect(found).toBeCalledTimes(1);
  });

  it('should filter balance transfers from criteria', () => {
    const found = jest.fn();

    blocks()(mockRxApi).pipe(
      mongoFilterFrom({
        'block.extrinsics.call.section': 'balances',
        'block.extrinsics.call.method': 'transferKeepAlive'
      })
    ).subscribe(found);

    expect(found).toBeCalledTimes(1);
  });
});