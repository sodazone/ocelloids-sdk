/*
 * Copyright 2023-2024 SO/DA zone ~ Marc Fornós & Xueying Wang
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Observable, retry, asyncScheduler, SchedulerLike } from 'rxjs';

/**
 * Configuration options for the truncated exponential backoff strategy.
 *
 * @property baseDelay - The base delay in milliseconds.
 * @property maxDelay  - The maximum delay in milliseconds between retry attempts.
 * @property maxCount  - The maximum number of retry attempts. If not specified, retries will continue indefinitely.
 */
export type TruncatedExpBackoffConfig = {
  baseDelay?: number,
  maxDelay?: number,
  maxCount?: number
};

/**
 * A custom retry strategy that implements truncated exponential backoff.
 *
 * @param baseDelay The base delay in milliseconds.
 * @param maxDelay The maximum delay in milliseconds between retry attempts.
 * @param scheduler The scheduler to use for scheduling the retry attempts (default: asyncScheduler).
 * @returns A delay function compatible with the retry operator.
 */
export function truncatedExpBackoff(
  baseDelay: number,
  maxDelay: number,
  scheduler: SchedulerLike = asyncScheduler
) {
  return (_error: any, retryCount: number) : Observable<number> => {
    const delay = Math.min(baseDelay * 2 ** retryCount, maxDelay);

    return new Observable((subscriber) => {
      return scheduler.schedule(function () {
        if (!subscriber.closed) {
          subscriber.next(1);
          subscriber.complete();
        }
      }, delay);
    });
  };
}

/**
 * Retry operator with truncated exponential backoff strategy.
 *
 * @param config An object containing configuration options for truncatedExpBackoff.
 * @returns A retry operator that uses truncated exponential backoff for retry attempts.
 */
export function retryWithTruncatedExpBackoff<T>({
  baseDelay = 10,
  maxDelay = 900000, // 15 minutes,
  maxCount = Infinity
} : TruncatedExpBackoffConfig = {}) {
  return retry<T>({
    count: maxCount,
    delay: truncatedExpBackoff(
      baseDelay,
      maxDelay
    ),
    resetOnSuccess: true
  });
}