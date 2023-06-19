import { ControlQuery } from './query.js';

describe('control query', () => {
  it('should construct an underlying query', () => {
    const q = ControlQuery.from({
      $and: [
        { 'event.section': 'balances' },
        { 'event.method': 'Transfer' },
        {
          $or: [
            { 'event.data.from': '0x0' },
            { 'event.data.to': '0x1' }
          ]
        }
      ]
    });
    expect(q).toBeDefined();
    expect(q.getValue().test({
      event: {
        section: 'balances',
        method: 'Transfer',
        data: {
          from: '0x0',
          to: '0x1'
        }
      }
    })).toBeTruthy();
  });
});