import type { EventRecord } from '@polkadot/types/interfaces';

import { mockRxApi, testEvents } from '@soda/ocelloids-test';

import { events } from './events.js';

describe('events reactive observable', () => {
  describe('events', () => {
    it('should emit the latest system events', done => {
      const testPipe = events()(mockRxApi);
      let index = 0;
      const next = jest.fn().mockImplementation((result: EventRecord) => {
        expect(result).toBeDefined();
        expect(result.event).toBeDefined();
        expect(result.event.section).toEqual(testEvents[index].event.section);
        expect(result.event.hash).toEqual(testEvents[index].event.hash);
        index++;
      });
      const complete = jest.fn().mockImplementation(() => {
        expect(index).toBe(testEvents.length);
        done();
      });

      testPipe.subscribe({
        next,
        complete,
      });

      expect(next).toBeCalledTimes(testEvents.length);
      expect(complete).toBeCalledTimes(1);
    });
  });
});