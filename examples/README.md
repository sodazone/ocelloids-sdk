# Ocelloids SDK Examples

The demo applications have shebangs to be executed with [ts-node-esm](https://typestrong.org/ts-node/).
Alternatively, you can execute them with [bun](https://bun.sh).

## Examples

| Application      | Command                      |
| ---------------- | ---------------------------- |
| filter-xt        | ./filter-exstrinsics/main.ts |
| filter-transfers | ./filter-transfers/main.ts   |
| watch-transfers  | ./balance-transfers/main.ts  |
| follow-transfers | ./follow-transfers/main.ts   |

For example, you can run `filter-transfers` as:

```shell
./filter-transfers/main.ts
```
<details>
<summary>output - click to expand</summary>

```javascript
// ...omitted...
{
  method: 'Transfer',
  section: 'balances',
  index: '0x0502',
  data: {
    from: '14GuP6QAfK9uwo3MQ9LrcmEqttcrtoNfDaSHn2BVaYcJJBg6',
    to: '12But7r26e2UwZkSYC8bU5nQdyfqWXswZEwS1tbH9nD8CXvK',
    amount: '54,719,854,400'
  }
}
{
  method: 'Transfer',
  section: 'balances',
  index: '0x0502',
  data: {
    from: '15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5',
    to: '1kQ9eipxazLU1UCtiVrvqwArMP2f1mEPnWdW7T95rxkgc4T',
    amount: '354,400,060,800'
  }
}
// ...omitted...
```
</details>