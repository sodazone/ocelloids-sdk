// Copyright 2023-2024 SO/DA zone
// SPDX-License-Identifier: Apache-2.0

import { ControlQuery } from './query.js'

const testAddress = '1a1LcBX6hGPKg5aQ6DXZpAHCCzWjckhea4sz3P1PvL3oc4F'

describe('control query', () => {
  it('should filter out dispatch errors', () => {
    const q = ControlQuery.from({
      dispatchError: { $eq: undefined },
      'extrinsic.section': 'convictionVoting',
      'extrinsic.method': 'vote',
    })
    const extrinsic = {
      section: 'convictionVoting',
      method: 'vote',
    }
    expect(q).toBeDefined()
    expect(
      q.getValue().test({
        extrinsic,
        dispatchError: 'errored',
      })
    ).toBeFalsy()
    expect(
      q.getValue().test({
        extrinsic,
        dispatchError: undefined,
      })
    ).toBeTruthy()
    expect(
      q.getValue().test({
        extrinsic,
        dispatchError: null,
      })
    ).toBeTruthy()
    expect(
      q.getValue().test({
        extrinsic,
      })
    ).toBeTruthy()
  })

  it('should construct an underlying query', () => {
    const q = ControlQuery.from({
      $and: [
        { 'event.section': 'balances' },
        { 'event.method': 'Transfer' },
        {
          $or: [{ 'event.data.from': testAddress }, { 'event.data.to': testAddress }],
        },
      ],
    })
    expect(q).toBeDefined()
    expect(
      q.getValue().test({
        event: {
          section: 'balances',
          method: 'Transfer',
          data: {
            from: testAddress,
            to: '5CdiCGvTEuzut954STAXRfL8Lazs3KCZa5LPpkPeqqJXdTHp',
          },
        },
      })
    ).toBeTruthy()
  })

  it('should construct a query from criteria', () => {
    const q = new ControlQuery({
      a: { $exists: true },
    })
    expect(
      q.getValue().test({
        a: 'b',
      })
    ).toBeTruthy()
  })

  it('should construct a query from other control query', () => {
    const q = ControlQuery.from(
      new ControlQuery({
        a: { $exists: true },
      })
    )
    expect(
      q.getValue().test({
        a: 'b',
      })
    ).toBeTruthy()
  })

  it('should be able to use custom query ops', () => {
    const data = {
      method: 'transferAllowDeath',
      section: 'balances',
      args: {
        dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
        value: '108515280000000000',
      },
    }
    const q = ControlQuery.from({
      'args.value': { $bn_lt: '108515280000000001' },
    })

    expect(q.getValue().test(data)).toBeTruthy()
  })

  it('should be able to change the query value', () => {
    const data = [
      {
        method: 'transferAllowDeath',
        section: 'balances',
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: '108515280000000000',
        },
      },
      {
        method: 'transferAllowDeath',
        section: 'balances',
        args: {
          dest: { id: '14NEHDwc5PPQfEjzLVDbVbi4djQLQZ9u7mMU3BPhTFJf4cD6' },
          value: '108515280000000001',
        },
      },
    ]

    const q = ControlQuery.from({
      'args.value': { $bn_lt: '108515280000000001' },
    })

    expect(q.getValue().test(data[0])).toBeTruthy()
    expect(q.getValue().test(data[1])).toBeFalsy()

    q.change({
      'args.value': { $bn_gt: '108515280000000000' },
    })

    expect(q.getValue().test(data[0])).toBeFalsy()
    expect(q.getValue().test(data[1])).toBeTruthy()
  })
})
