import { configuration } from '../index.js';
import { SubstrateApis } from './substrate-apis.js';

test('instantiate', async () => {
  //* TODO: mock ws
  const apis = new SubstrateApis(configuration);
  expect(apis).toBeDefined();
  //*/
});