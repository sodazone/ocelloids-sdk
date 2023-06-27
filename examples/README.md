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
// ...skip...
{
  eventId: '16134446-2-0',
  extrinsicId: '16134446-2',
  extrinsicPosition: 0,
  blockNumber: '16,134,446',
  method: 'Withdraw',
  section: 'balances',
  index: '0x0508',
  data: {
    who: '12xtAYsRUrmbniiWQqJtECiBQrMn8AypQcXhnQAc6RB6XkLW',
    amount: '161,430,964'
  }
}
{
  eventId: '16134446-2-4',
  extrinsicId: '16134446-2',
  extrinsicPosition: 4,
  blockNumber: '16,134,446',
  method: 'Deposit',
  section: 'balances',
  index: '0x0507',
  data: {
    who: '13UVJyLnbVp9RBZYFwFGyDvVd1y27Tt8tkntv6Q7JVPhFsTB',
    amount: '129,144,771'
  }
}
{
  eventId: '16134446-2-6',
  extrinsicId: '16134446-2',
  extrinsicPosition: 6,
  blockNumber: '16,134,446',
  method: 'Deposit',
  section: 'balances',
  index: '0x0507',
  data: {
    who: '12YVhYTtGpTCSXRvPHyNjDK7y5p4J52ppBVJGjWh2PGrUe9r',
    amount: '32,286,193'
  }
}
```
</details>