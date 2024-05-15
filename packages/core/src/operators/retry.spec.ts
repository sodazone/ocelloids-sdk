// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { defer, of, throwError } from 'rxjs'
import { retryWithTruncatedExpBackoff, truncatedExpBackoff } from './retry.js'

const errorUntil = (until: number) => {
  let c = 0
  return defer(() => (++c < until ? throwError(() => Error('some')) : of(c)))
}

describe('retry with truncated exponential backoff', () => {
  it('should not retry', (done) => {
    of(1)
      .pipe(retryWithTruncatedExpBackoff())
      .subscribe((x) => {
        expect(x).toBe(1)
        done()
      })
  })

  it('should retry 3 times', (done) => {
    errorUntil(3)
      .pipe(retryWithTruncatedExpBackoff({ baseDelay: 1 }))
      .subscribe((x) => {
        expect(x).toBe(3)
        done()
      })
  })

  it('should truncate on infinity', (done) => {
    truncatedExpBackoff(1, 10)(null, Infinity).subscribe(() => {
      done()
    })
  })
})
