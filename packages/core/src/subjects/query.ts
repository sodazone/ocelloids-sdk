/*
 * Copyright 2023 SO/DA zone - Marc Fornós & Xueying Wang
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

import { BehaviorSubject, Subject } from 'rxjs';

import { Query } from 'mingo';
import { RawObject } from 'mingo/types';

// Installs mingo operators
import { installOperators } from './mingo-ops.js';
installOperators();

export type Criteria = RawObject;

/**
 * Represents a control subject that can be used to change the value of a query.
 */
export interface Control<T, S> extends Subject<S> {
  /**
   * Changes the value of the control.
   * @param value The new value for the control.
   */
  change: (value: T) => void
}

/**
 * Represents a behavior subject for managing queries with a criteria.
 *
 * ## Example
 *
 * ```ts
 * import { ControlQuery } from '@sodazone/ocelloids';
 *
 * // Filter all balance transfer from an EventRecord for an address
 * ControlQuery.from({
 *  $and: [
 *     { 'event.section': 'balances' },
 *     { 'event.method': 'Transfer' },
 *     {
 *       $or: [
 *         { 'event.data.from': '1a1LcBX6hGPKg5aQ6DXZpAHCCzWjckhea4sz3P1PvL3oc4F' },
 *         { 'event.data.to': '1a1LcBX6hGPKg5aQ6DXZpAHCCzWjckhea4sz3P1PvL3oc4F' }
 *       ]
 *     }
 *   ]
 * });
 * ```
 */
export class ControlQuery
  extends BehaviorSubject<Query>
  implements Control<Criteria, Query> {
  /**
   * Constructs a new instance of the `ControlQuery` class.
   * @param criteria The initial criteria for the query.
   */
  constructor(criteria: Criteria) {
    super(new Query(criteria));
  }

  /**
   * Changes the criteria of the query.
   * @param criteria The new criteria for the query.
   */
  change(criteria: Criteria): void {
    this.next(new Query(criteria));
  }

  /**
   * Checks if an object is an instance of `ControlQuery`.
   * @param obj The object to check.
   * @returns `true` if the object is an instance of `ControlQuery`, `false` otherwise.
   */
  static isControlQuery(obj: ControlQuery | Criteria): obj is ControlQuery {
    return obj.change !== undefined;
  }

  /**
   * Creates a `ControlQuery` instance.
   * @param criteria The initial criteria for the query.
   */
  static from(criteria: ControlQuery | Criteria) : ControlQuery {
    return ControlQuery.isControlQuery(criteria)
      ? criteria
      : new ControlQuery(criteria);
  }
}

