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

import { Query } from 'mingo';

import { installOperators } from './mingo-ops.js';
installOperators();

const data = {
  method: 'transferAllowDeath',
  section: 'balances',
  args: {
    dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
    value: '108515280000000000'
  }
};

describe('mingo query ops', () => {
  it('should compare lt bn', () => {
    const q = new Query({
      'args.value': { $bn_lt: '108515280000000001'}
    });

    expect(q.test(data)).toBeTruthy();
  });
  it('should compare lt bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_lt: '108515280000000000'}
    });

    expect(q.test(data)).toBeFalsy();
  });

  it('should compare lte bn', () => {
    const q = new Query({
      'args.value': { $bn_lte: '108515280000000000'}
    });

    expect(q.test(data)).toBeTruthy();
  });

  it('should compare lte bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_lte: '108515270000000000'}
    });

    expect(q.test(data)).toBeFalsy();
  });

  it('should compare gt bn', () => {
    const q = new Query({
      'args.value': { $bn_gt: '108515270000000000'}
    });

    expect(q.test(data)).toBeTruthy();
  });

  it('should compare gt bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_gt: '108515280000000001'}
    });

    expect(q.test(data)).toBeFalsy();
  });

  it('should compare gte bn', () => {
    const q = new Query({
      'args.value': { $bn_gte: '108515280000000000'}
    });

    expect(q.test(data)).toBeTruthy();
  });

  it('should compare eq bn', () => {
    const q = new Query({
      'args.value': { $bn_eq: '108515280000000000'}
    });

    expect(q.test(data)).toBeTruthy();
  });

  it('should compare eq bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_eq: '108515280000000001'}
    });

    expect(q.test(data)).toBeFalsy();
  });

  it('should compare neq bn', () => {
    const q = new Query({
      'args.value': { $bn_neq: '108515280000000001'}
    });

    expect(q.test(data)).toBeTruthy();
  });

  it('should compare neq bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_neq: '108515280000000000'}
    });

    expect(q.test(data)).toBeFalsy();
  });

  it('should work with numbers', () => {
    const q = new Query({
      'args.value': { $bn_eq: 100 }
    });

    expect(q.test({args: {
      dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
      value: 100
    }})).toBeTruthy();
  });

  it('should work with numbers, falsy case', () => {
    const q = new Query({
      'args.value': { $bn_eq: 101 }
    });

    expect(q.test({args: {
      dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
      value: 100
    }})).toBeFalsy();
  });

  it('should work with numbers and strings', () => {
    const q = new Query({
      'args.value': { $bn_gt: 100 }
    });

    expect(q.test({
      args: {
        dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
        value: '108515280000000000'
      }
    })).toBeTruthy();
  });

  it('should work with numbers and strings, falsy case', () => {
    const q = new Query({
      'args.value': { $bn_lt: 100 }
    });

    expect(q.test({
      args: {
        dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
        value: '108515280000000000'
      }
    })).toBeFalsy();
  });

  it('should fail on non big numerish types', () => {
    const q = new Query({
      'args.value': { $bn_lt: { obj: true } }
    });

    expect(() => {
      q.test({
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: '108515280000000000'
        }
      });
    }).toThrow();
  });

  it('should be idempotent on ops registration', () => {
    expect(() => {
      installOperators();
      installOperators();
    }).not.toThrow();
  });
});