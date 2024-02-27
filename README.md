# CARTESI-WALLET

This is a typescript based Wallet implementation for Cartesi Dapps to handle different types of Assets.

## Methods

```
Wallet {
      balance_get,
      _ether_deposit,
      _erc20_deposit,
      _erc721_deposit,
      ether_withdraw,
      ether_transfer,
      erc20_withdraw,
      erc20_transfer,
      erc721_withdraw,
      erc721_transfer
    }
```

## Installing

```
npm i cartesi-wallet
```

To use the Cartesi Wallet module in your project, first, import the module as follows:

```javascript
const { Wallet } = require("cartesi-wallet");
```

## Initialization

Create an instance of the Wallet by initializing it with an empty `Map` object:

```javascript
let wallet = new Wallet(new Map());
```

## Checking Balance

To retrieve the balance information from the wallet, use the `balance_get` method. This method should be called within the `inspect` function:

```javascript
let balance = wallet.balance_get(walletId);
```

The returned `balance` object includes several methods to access specific balance information:

- `ether_get()`: Returns the Ether balance as a `bigint`.
- `list_erc20()`: Returns a `Map` of ERC20 tokens with their balances.
- `list_erc721()`: Returns a `Map` of ERC721 tokens with a set of owned token IDs.
- `erc20_get(erc20: Address)`: Returns the balance of a specific ERC20 token, if available.
- `erc721_get(erc721: Address)`: Returns a set of token IDs for a specific ERC721 token, if available.

```javascript
ether_get(): bigint;
list_erc20(): Map<Address, bigint>;
list_erc721(): Map<Address, Set<number>>;
erc20_get(erc20: Address): bigint | undefined;
erc721_get(erc721: Address): Set<number> | undefined;
```

## Asset Handling Methods

For operations such as deposits, transfers, and withdrawals, use the method inside the advance function.

### Deposits

To process a deposit, ensure the sender is the designated portals smart contract (e.g., the default ERC20Portal smart contract from sunodo or nonodo when running locally). You might need to adjust the smart contract address based on your deployment or dynamically retrieve it from a resource file:

```javascript
if (data.metadata.msg_sender.toLowerCase() == "0x9C21AEb2093C32DDbC53eEF24B873BDCd1aDa1DB".toLowerCase()) {
  let notice = wallet.erc20_deposit_process(data.payload);
  await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: notice.payload }),
  });
}
```

### Transfers and Withdrawals

The payload format for transfers and withdrawals may vary with every application. Below is an example payload for the implementations that follow:

```javascript
// Example payload for "transfer" method
{
    "method": "transfer",
    "from": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "to": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "erc20": "0xae7f61eCf06C65405560166b259C54031428A9C4",
    "amount": 5000000000000000000
}

// Example payload for "withdraw" method
{
    "method": "withdraw",
    "from": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "erc20": "0xae7f61eCf06C65405560166b259C54031428A9C4",
    "amount": 3000000000000000000
}
```

Parse the input and process the requested operation accordingly.
Note: the following examples to not check the sender to perform this operations. In such cases is highly recommended to perform a check such as ` data.metadata.msg_sender === json.from ` so only that individual can perform operations from inside their wallet.

```javascript
let input = data.payload;
let str = Buffer.from(input.substr(2), "hex").toString("utf8");
let json = JSON.parse(str);

if (json.method == "transfer") {
  let notice = wallet.erc20_transfer(json.from, json.to, json.erc20, BigInt(json.amount));
  await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload: notice.payload }),
  });
} else if (json.method == "withdraw") {
  try {
    let voucher = wallet.erc20_withdraw(json.from, json.erc20, BigInt(json.amount));
    await fetch(rollup_server + "/voucher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: voucher.payload, destination: voucher.destination }),
    });
  } catch (error) {
    console.log("ERROR");
    console.log(error);
  }
}
```

### Other Tokens

For other token types (e.g., Ether, ERC721), the method signatures are similar, and the logic for deposits, transfers, and withdrawals follows the same pattern as described above.
Here are the functions:

```javascript
balance_get: (_account: Address) => Balance;

ether_deposit_process: (_payload: string) => Output;
ether_withdraw: (rollup_address: Address, account: Address, amount: bigint) => Voucher | Error_out;
ether_transfer: (account: Address, to: Address, amount: bigint) => Notice | Error_out;

erc20_deposit_process: (_payload: string) => Output;
erc20_withdraw: (account: Address, erc20: Address, amount: bigint) => Voucher | Error_out;
erc20_transfer: (account: Address, to: Address, erc20: Address, amount: bigint) => Notice | Error_out;

erc721_deposit_process: (_payload: string) => Output;
erc721_withdraw: (rollup_address: Address, sender: Address, erc721: Address, token_id: number) => Voucher | Error_out;
erc721_transfer: (account: Address, to: Address, erc721: Address, token_id: number) => Notice | Error_out;
```
