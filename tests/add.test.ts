import { Wallet } from "../src";
import { Address } from "viem";
import { Balance } from "../src/balance";
test("Create a wallet correctly", () => {
  const wallet = new Wallet(new Map<Address, Balance>());
  console.log(wallet);
});
