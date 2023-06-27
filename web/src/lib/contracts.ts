import { goerli, zora, zoraTestnet } from "@wagmi/chains";
import { Address } from "viem";

export const CONTRACTS_BY_NETWORK: Record<
  number,
  { creativeMintManager: Address; fixedPriceSalesConfig: Address }
> = {
  [zoraTestnet.id]: {
    creativeMintManager:
      "0x45800a5853091ba3D992De3a114eDBc8F6DaD039" as Address,
    fixedPriceSalesConfig:
      "0xd81351363b7d80b06E4Ec4De7989f0f91e41A846" as Address,
  },
  [zora.id]: {
    creativeMintManager:
      "0xa306BF2973dAd706E5685f051A9DfD7Df1CdDcBD" as Address,
    fixedPriceSalesConfig:
      "0x169d9147dFc9409AfA4E558dF2C9ABeebc020182" as Address,
  },
  [goerli.id]: {
    creativeMintManager:
      "0x2572259361ee3100e388b75d91b807bda2c8b118" as Address,
    fixedPriceSalesConfig:
      "0xD8EB23E82f0795427F27D7F20CAb56e7630D1166" as Address,
  },
} as const;
