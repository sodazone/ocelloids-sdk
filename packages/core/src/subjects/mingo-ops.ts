// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { bnToBn, logger } from '@polkadot/util';

import { OperatorType, useOperators, QueryOperator, Options, getOperator } from 'mingo/core';
import { BASIC_CONTEXT } from 'mingo/init/basic';
import { AnyVal, Predicate, RawObject } from 'mingo/types';
import { ensureArray, resolve } from 'mingo/util';

const l = logger('oc-mingo-ops');

function bn(x: AnyVal) {
  switch (typeof x) {
    case 'number':
    case 'string':
    case 'bigint':
      return bnToBn(x);
    default:
      throw new Error(`unable to convert ${typeof x} to BN`);
  }
}

function compare(a: AnyVal, b: AnyVal, f: Predicate<AnyVal>): boolean {
  return ensureArray(a).some((x) => f(x, b));
}

function $bn_lt(a: AnyVal, b: AnyVal): boolean {
  return compare(a, b, (x: AnyVal, y: AnyVal) => bn(x).lt(bn(y)));
}

function $bn_lte(a: AnyVal, b: AnyVal): boolean {
  return compare(a, b, (x: AnyVal, y: AnyVal) => bn(x).lte(bn(y)));
}

function $bn_gt(a: AnyVal, b: AnyVal): boolean {
  return compare(a, b, (x: AnyVal, y: AnyVal) => bn(x).gt(bn(y)));
}

function $bn_gte(a: AnyVal, b: AnyVal): boolean {
  return compare(a, b, (x: AnyVal, y: AnyVal) => bn(x).gte(bn(y)));
}

function $bn_eq(a: AnyVal, b: AnyVal): boolean {
  return compare(a, b, (x: AnyVal, y: AnyVal) => bn(x).eq(bn(y)));
}

function $bn_neq(a: AnyVal, b: AnyVal): boolean {
  return compare(a, b, (x: AnyVal, y: AnyVal) => !bn(x).eq(bn(y)));
}

function createQueryOperator(predicate: Predicate<AnyVal>): QueryOperator {
  const f = (selector: string, value: AnyVal, options: Options) => {
    const opts = { unwrapArray: true };
    const depth = Math.max(1, selector.split('.').length - 1);
    return (obj: RawObject): boolean => {
      // value of field must be fully resolved.
      const lhs = resolve(obj, selector, opts);
      return predicate(lhs, value, { ...options, depth });
    };
  };
  f.op = 'query';
  return f; // as QueryOperator;
}

export function installOperators() {
  // Register query operators
  if (
    getOperator(OperatorType.QUERY, '$bn_lt', {
      useGlobalContext: true,
      context: BASIC_CONTEXT,
    }) === null
  ) {
    l.debug('register operators');

    useOperators(OperatorType.QUERY, {
      $bn_lt: createQueryOperator($bn_lt),
      $bn_lte: createQueryOperator($bn_lte),
      $bn_gt: createQueryOperator($bn_gt),
      $bn_gte: createQueryOperator($bn_gte),
      $bn_eq: createQueryOperator($bn_eq),
      $bn_neq: createQueryOperator($bn_neq),
    });
  }
}
