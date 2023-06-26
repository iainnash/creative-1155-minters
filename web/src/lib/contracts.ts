import { goerli, zora, zoraTestnet } from "@wagmi/chains";
import { Address } from "viem";

export const CONTRACT_BY_NETWORK = {
  [zoraTestnet.id]: "0x45800a5853091ba3D992De3a114eDBc8F6DaD039" as Address,
  [zora.id]: "0x6E269B9E7eaBe364c36744D2988687e8F47C2f9a" as Address,
  [goerli.id]: "0x2572259361ee3100e388b75d91b807bda2c8b118" as Address,
} as const;
