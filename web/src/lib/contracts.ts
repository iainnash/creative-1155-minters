import { goerli, zora, zoraTestnet } from "@wagmi/chains";
import { Address } from "viem";

export const CONTRACT_BY_NETWORK = {
  [zoraTestnet.id]: "0xeAC1bEe0bD25561926Ff2273B7E565A0d385d42E" as Address,
  [zora.id]: "0x0",
  [goerli.id]: "0x2572259361ee3100e388b75d91b807bda2c8b118" as Address,
} as const;
