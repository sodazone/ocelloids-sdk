# Ocelloids SDK Examples

The demo applications have shebangs to be executed with [ts-node-esm](https://typestrong.org/ts-node/).

Alternatively, you can run them with [bun](https://bun.sh).

## Examples

| Application            | Command                          |
| ---------------------- | -------------------------------- |
| filter-extrinstics     | ./filter-exstrinsics/main.ts     |
| filter-fee-events      | ./filter-fee-events/main.ts      |
| watch-transfer-events  | ./watch-transfer-events/main.ts  |
| follow-transfer-events | ./follow-transfer-events/main.ts |

For example, you can run `filter-fee-events` as:

```shell
./filter-fee-events/main.ts
```
<details>
<summary>output - click to expand</summary>

```javascript
// ...omitted...
{
  eventId: '16134448-2',
  extrinsicId: '16134448-2',
  extrinsicPos: 6,
  blockNumber: '16,134,448',
  blockPos: 2,
  method: 'Deposit',
  section: 'balances',
  index: '0x0507',
  data: {
    who: '12MgK2Sc8Rrh6DXS2gDrt7fWJ24eGeVb23NALbZLMw1grnkL',
    amount: '31,863,304'
  }
}
{
  eventId: '16134538-2',
  extrinsicId: '16134538-2',
  extrinsicPos: 0,
  blockNumber: '16,134,538',
  blockPos: 2,
  method: 'Withdraw',
  section: 'balances',
  index: '0x0508',
  data: {
    who: '15iLWC7Gqt2z5a9Vq2hjaw3VXkarkY5gAVdAkknV1khVhLck',
    amount: '157,316,518'
  }
}
{
  eventId: '16134538-2',
  extrinsicId: '16134538-2',
  extrinsicPos: 4,
  blockNumber: '16,134,538',
  blockPos: 2,
  method: 'Deposit',
  section: 'balances',
  index: '0x0507',
  data: {
    who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
    amount: '125,853,214'
  }
}
// ...omitted...
```
</details>