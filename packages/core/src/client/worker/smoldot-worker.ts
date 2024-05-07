import * as smoldot from 'smoldot/worker';
import { compileBytecode } from 'smoldot/bytecode';

compileBytecode().then((bytecode) => postMessage(bytecode));

addEventListener(
  'message',
  (event) => {
    smoldot.run(event.data).finally(() => close());
  },
  {
    once: true,
  }
);
