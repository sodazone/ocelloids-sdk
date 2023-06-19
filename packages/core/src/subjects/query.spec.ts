import { ControlQuery } from './query.js';

const testAddress = '1a1LcBX6hGPKg5aQ6DXZpAHCCzWjckhea4sz3P1PvL3oc4F';

describe('control query', () => {
  it('should construct an underlying query', () => {
    const q = ControlQuery.from({
      $and: [
        { 'event.section': 'balances' },
        { 'event.method': 'Transfer' },
        {
          $or: [
            { 'event.data.from': testAddress },
            { 'event.data.to': testAddress }
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
          from: testAddress,
          to: '5CdiCGvTEuzut954STAXRfL8Lazs3KCZa5LPpkPeqqJXdTHp'
        }
      }
    })).toBeTruthy();
  });
});