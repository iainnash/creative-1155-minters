import { zora } from "@wagmi/chains";
import { getDefaultConfig } from "connectkit";
import { goerli, zoraTestnet } from "viem/chains";
import { createConfig, mainnet } from "wagmi";

export const config = createConfig(
  getDefaultConfig({
    // chains: [mainnet, goerli, zora, zoraTestnet],
    chains: [zoraTestnet, zora, goerli],
    // Required API Keys
    alchemyId: process.env.ALCHEMY_ID, // or infuraId
    walletConnectProjectId: process.env.WALLETCONNECT_PROJECT_ID!,

    // Required
    appName: "1155 Minting Demo",

    // Optional
    appDescription: "1155 Minting Demo",
    //   appUrl: "https://family.co", // your app's url
    //   appLogo: "https://family.co/logo.png", // your app's logo,no bigger than 1024x1024px (max. 1MB)
  })
);
