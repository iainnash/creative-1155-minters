import "../styles/globals.css";
import type { AppProps } from "next/app";

import { WagmiConfig } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { config } from "@/lib/config";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider debugMode>
        <Component {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
