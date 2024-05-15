import { compileBytecode } from 'smoldot/bytecode'
import * as smoldot from 'smoldot/worker'

compileBytecode().then((bytecode) => postMessage(bytecode))

addEventListener(
  'message',
  (event) => {
    smoldot.run(event.data).finally(() => close())
  },
  {
    once: true,
  }
)
