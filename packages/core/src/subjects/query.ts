import { BehaviorSubject, ReplaySubject, Observable, Subject } from 'rxjs';
import { Query } from 'mingo';

import { ApiRx } from '@polkadot/api';

export type AnyVal = unknown;
export type RawObject = Record<string, AnyVal>;
export type Criteria = RawObject;

/**
 * Represents a control object that can be used to change the value of a query.
 */
export interface Control<T, S> extends Subject<S> {
  /**
   * Changes the value of the control.
   * @param value The new value for the control.
   */
  change: (value: T) => void
}

/**
 * Represents a control object for managing queries with a criteria.
 * Extends the `BehaviorSubject` class.
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
   * Creates a `ControlQuery` instance.
   * @param criteria The initial criteria for the query.
   */
  static from(criteria: Criteria) : ControlQuery {
    return new ControlQuery(criteria);
  }
}

/**
 * Represents a control object for managing queries with an API.
 * Extends the `ReplaySubject` class.
 */
export class ControlQueryWithApi<T>
  extends ReplaySubject<Query>
  implements Control<Observable<ApiRx>, Query> {
  /**
   * Constructs a new instance of the `ControlQueryWithApi` class.
   * @param result A function that maps an `Observable` of `ApiRx` to an `Observable` of type `T`.
   * @param criteria A function that defines the criteria for the query based on the result of type `T`.
   */
  constructor(
    private readonly result: (api: Observable<ApiRx>) => Observable<T>,
    private readonly criteria: (x: T) => Criteria
  ) {
    super(1);
  }

  /**
   * Changes the value of the control using an `Observable` of `ApiRx`.
   * @param api The `Observable` of `ApiRx` to be used for the query.
   */
  change(api: Observable<ApiRx>) {
    const sub = this.result(api).subscribe(x => {
      this.next(new Query(this.criteria(x)));
      sub.unsubscribe();
    });
  }

  /**
   * Creates a new `ControlQueryWithApi` instance and immediately triggers the change using the provided parameters.
   * @param api The `Observable` of `ApiRx` to be used for the query.
   * @param source A function that maps an `Observable` of `ApiRx` to an `Observable` of type `S`.
   * @param criteria A function that defines the criteria for the query based on the result of type `S`.
   * @returns A new instance of `ControlQueryWithApi` with the initial query based on the provided parameters.
   */
  static from<S>(
    api: Observable<ApiRx>,
    source: (src: Observable<ApiRx>) => Observable<S>,
    criteria: (x: S) => Criteria
  ) {
    const control = new ControlQueryWithApi<S>(source, criteria);
    control.change(api);
    return control;
  }
}
