import { CONTRACT_BY_NETWORK } from "@/lib/contracts";
import { factoryABI } from "@/lib/factoryABI";
import { zoraTestnet } from "@wagmi/chains";
import { ConnectKitButton } from "connectkit";
import {
  Address,
  useAccount,
  useChainId,
  useContractEvent,
  useContractWrite,
} from "wagmi";

const target = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as Address;

export const MintComponent = ({
  type,
  metadata,
}: {
  type: string;
  metadata: any;
}) => {
  const chain = useChainId();
  const { address } = useAccount();
  const { write, data } = useContractWrite({
    address: (CONTRACT_BY_NETWORK as any)[chain],
    abi: factoryABI,
    functionName: "mintProject",
    args: [type, `ipfs://${metadata.metadata}`, BigInt("18446744073709552000")],
  });

  useContractEvent({
    chainId: zoraTestnet.id,
    address: target,
    abi: factoryABI,
    eventName: "ProjectMinted",
    listener(log) {
      console.log(log);
      alert(log);
    },
  });

  if (!address) {
    return (
      <>
        Connect your wallet to mint:
        <ConnectKitButton />
      </>
    );
  }
  return (
    <>
      <button onClick={() => write?.()} disabled={!write}>
        Mint
      </button>
    </>
  );
};
