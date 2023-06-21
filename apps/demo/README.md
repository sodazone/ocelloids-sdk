TBD

```
❯ bunx xtwatch < demo/filters/balances.hjson | jq .
{
  "extrinsicId": "16066813-2",
  "blockNumber": "16,066,813",
  "position": 2,
  "isSigned": true,
  "method": {
    "args": {
      "dest": {
        "Id": "158FWgHvrKofccBRtxbxzyZZsAiGanBBCwJnSy1uZZTy6bVr"
      },
      "value": "120,309,708,100"
    },
    "method": "transferKeepAlive",
    "section": "balances"
  },
  "era": {
    "MortalEra": {
      "period": "1,024",
      "phase": "248"
    }
  },
  "nonce": "52,543",
  "signature": "0x2143c42008b5e9fd860aedaa465ed602bc73df6b3985e021d95724c7a3ead1b741413213492899c33b174b34da5ad34f58e6e9dccaa803e2f48290fbd4cc5503",
  "signer": {
    "Id": "12nr7GiDrYHzAYT9L8HdeXnMfWcBuYfAXpgfzf3upujeCciz"
  },
  "tip": "0"
}
{
  "extrinsicId": "16066821-2",
  "blockNumber": "16,066,821",
  "position": 2,
  "isSigned": true,
  "method": {
    "args": {
      "dest": {
        "Id": "15QFBQY6TF6Abr6vA1r6opRh6RbRSMWgBC1PcCMDDzRSEXf5"
      },
      "value": "49,993,540,000,000"
    },
    "method": "transferAllowDeath",
    "section": "balances"
  },
  "era": {
    "MortalEra": {
      "period": "512",
      "phase": "249"
    }
  },
  "nonce": "0",
  "signature": "0x8d978d67bd0c58a52a8710c1a6d520086a7cb86ebba7ecec8f512e6d2c05c4b91d8761f1adbecad43ae611e3ca2019a963e98f7e697dc673039a787968a44803",
  "signer": {
    "Id": "146oJYKZtDhEpuHsNeXW6zuneSDpFFv2BPkvc9gNWhKWN9Ra"
  },
  "tip": "0"
}
...
```
