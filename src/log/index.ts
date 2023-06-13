import * as Pino from 'pino';

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

export const logger = isBrowser ?  (Pino as any).default() : Pino.pino();