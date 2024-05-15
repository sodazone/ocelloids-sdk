// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { Query } from 'mingo'

import { installOperators } from './mingo-ops.js'
installOperators()

const data = {
  method: 'transferAllowDeath',
  section: 'balances',
  args: {
    dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
    value: '108515280000000000',
  },
}

describe('mingo query ops', () => {
  it('should compare lt bn', () => {
    const q = new Query({
      'args.value': { $bn_lt: '108515280000000001' },
    })

    expect(q.test(data)).toBeTruthy()
  })
  it('should compare lt bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_lt: '108515280000000000' },
    })

    expect(q.test(data)).toBeFalsy()
  })

  it('should compare lte bn', () => {
    const q = new Query({
      'args.value': { $bn_lte: '108515280000000000' },
    })

    expect(q.test(data)).toBeTruthy()
  })

  it('should compare lte bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_lte: '108515270000000000' },
    })

    expect(q.test(data)).toBeFalsy()
  })

  it('should compare gt bn', () => {
    const q = new Query({
      'args.value': { $bn_gt: '108515270000000000' },
    })

    expect(q.test(data)).toBeTruthy()
  })

  it('should compare gt bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_gt: '108515280000000001' },
    })

    expect(q.test(data)).toBeFalsy()
  })

  it('should compare gte bn', () => {
    const q = new Query({
      'args.value': { $bn_gte: '108515280000000000' },
    })

    expect(q.test(data)).toBeTruthy()
  })

  it('should compare eq bn', () => {
    const q = new Query({
      'args.value': { $bn_eq: '108515280000000000' },
    })

    expect(q.test(data)).toBeTruthy()
  })

  it('should compare eq bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_eq: '108515280000000001' },
    })

    expect(q.test(data)).toBeFalsy()
  })

  it('should compare neq bn', () => {
    const q = new Query({
      'args.value': { $bn_neq: '108515280000000001' },
    })

    expect(q.test(data)).toBeTruthy()
  })

  it('should compare neq bn falsy case', () => {
    const q = new Query({
      'args.value': { $bn_neq: '108515280000000000' },
    })

    expect(q.test(data)).toBeFalsy()
  })

  it('should work with numbers', () => {
    const q = new Query({
      'args.value': { $bn_eq: 100 },
    })

    expect(
      q.test({
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: 100,
        },
      })
    ).toBeTruthy()
  })

  it('should work with numbers, falsy case', () => {
    const q = new Query({
      'args.value': { $bn_eq: 101 },
    })

    expect(
      q.test({
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: 100,
        },
      })
    ).toBeFalsy()
  })

  it('should work with numbers and strings', () => {
    const q = new Query({
      'args.value': { $bn_gt: 100 },
    })

    expect(
      q.test({
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: '108515280000000000',
        },
      })
    ).toBeTruthy()
  })

  it('should work with numbers and strings, falsy case', () => {
    const q = new Query({
      'args.value': { $bn_lt: 100 },
    })

    expect(
      q.test({
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: '108515280000000000',
        },
      })
    ).toBeFalsy()
  })

  it('should fail on non big numerish types', () => {
    const q = new Query({
      'args.value': { $bn_lt: { obj: true } },
    })

    expect(() => {
      q.test({
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: '108515280000000000',
        },
      })
    }).toThrow()
  })

  it('should be idempotent on ops registration', () => {
    expect(() => {
      installOperators()
      installOperators()
    }).not.toThrow()
  })
})
