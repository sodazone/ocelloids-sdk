// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { Observable, SchedulerLike, asyncScheduler, retry } from 'rxjs'

/**
 * Configuration options for the truncated exponential backoff strategy.
 *
 * @property baseDelay - The base delay in milliseconds.
 * @property maxDelay  - The maximum delay in milliseconds between retry attempts.
 * @property maxCount  - The maximum number of retry attempts. If not specified, retries will continue indefinitely.
 */
export type TruncatedExpBackoffConfig = {
  baseDelay?: number
  maxDelay?: number
  maxCount?: number
}

/**
 * A custom retry strategy that implements truncated exponential backoff.
 *
 * @param baseDelay The base delay in milliseconds.
 * @param maxDelay The maximum delay in milliseconds between retry attempts.
 * @param scheduler The scheduler to use for scheduling the retry attempts (default: asyncScheduler).
 * @returns A delay function compatible with the retry operator.
 */
export function truncatedExpBackoff(
  baseDelay: number = 10,
  maxDelay: number = 900000, // 15 minutes,
  scheduler: SchedulerLike = asyncScheduler
) {
  return (_error: any, retryCount: number): Observable<number> => {
    const delay = Math.min(baseDelay * 2 ** retryCount, maxDelay)

    return new Observable((subscriber) => {
      return scheduler.schedule(function () {
        if (!subscriber.closed) {
          subscriber.next(1)
          subscriber.complete()
        }
      }, delay)
    })
  }
}

/**
 * Retry operator with truncated exponential backoff strategy.
 *
 * @param config An object containing configuration options for truncatedExpBackoff.
 * @returns A retry operator that uses truncated exponential backoff for retry attempts.
 */
export function retryWithTruncatedExpBackoff<T>({ baseDelay, maxDelay, maxCount }: TruncatedExpBackoffConfig = {}) {
  return retry<T>({
    count: maxCount ?? Infinity,
    delay: truncatedExpBackoff(baseDelay, maxDelay),
    resetOnSuccess: true,
  })
}
