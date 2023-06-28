import { CONTRACTS_BY_NETWORK } from "@/lib/contracts";
import { getUserCollections } from "@/lib/subgraph";
import { goerli, zora, zoraTestnet } from "@wagmi/chains";
import {
  zoraCreator1155FactoryImplABI,
  zoraCreator1155ImplABI,
  zoraCreatorFixedPriceSaleStrategyABI,
} from "@zoralabs/zora-1155-contracts";
import { ConnectKitButton } from "connectkit";
import { useCallback, useMemo, useState } from "react";
import { Hex, encodeFunctionData, getContractAddress, parseEther } from "viem";
import {
  Address,
  useAccount,
  useChainId,
  useContractEvent,
  useContractWrite,
  useQuery,
} from "wagmi";

export const MintComponent = ({
  type,
  metadata,
}: {
  type: string;
  metadata: any;
}) => {
  const chain = useChainId();
  const { address } = useAccount();

  const { address: userAddress } = useAccount();
  const { data: userCollections, isLoading: collectionsLoading } = useQuery({
    // @ts-ignore
    queryKey: userAddress
      ? ["collections", { user: userAddress.toString(), chain }]
      : undefined,
    queryFn: getUserCollections,
  });

  // const { write, data } = useContractWrite({
  //   address: CONTRACTS_BY_NETWORK[chain].creativeMintManager,
  //   abi: factoryABI,
  //   functionName: "mintProject",
  //   args: [type, `ipfs://${metadata.metadata}`, BigInt("18446744073709552000")],
  // });

  const collection =
    (userCollections as any)?.zoraCreateContracts?.length > 0
      ? (userCollections as any).zoraCreateContracts[0]
      : undefined;
  const { write: setupNewToken, isLoading: setupNewTokenLoading } =
    useContractWrite({
      address: collection?.address,
      abi: zoraCreator1155ImplABI,
      functionName: "setupNewToken",
      args: [`ipfs://${metadata.metadata}`, BigInt("18446744073709552000")],
    });

  const contracts = CONTRACTS_BY_NETWORK[chain];

  const { write: writeCreateContract, isLoading: writingCreateContract } =
    useContractWrite({
      address: !collection ? contracts.zora1155CreatorFactory : undefined,
      abi: zoraCreator1155FactoryImplABI,
      functionName: "createContract",
      args: [
        "",
        "P5JS Mints",
        {
          royaltyMintSchedule: 0,
          royaltyBPS: 1000,
          royaltyRecipient: address!,
        },
        address!,
        [
          encodeFunctionData({
            abi: zoraCreator1155ImplABI,
            functionName: "setupNewToken",
            args: [
              `ipfs://${metadata.metadata}`,
              BigInt("18446744073709552000"),
            ],
          }),
        ],
      ],
    });

  const [minted, setMinted] = useState(false);
  const [mintedTo, setMintedTo] = useState<{
    target: Address;
    tokenId: bigint;
  } | null>(null);

  // useContractEvent({
  //   chainId: chain,
  //   address: contracts.creativeMintManager,
  //   abi: factoryABI,
  //   eventName: "MintedNewToken",
  //   listener(logs) {
  //     logs.find((log) => {
  //       if (
  //         log.eventName === "MintedNewToken" &&
  //         log.args.target &&
  //         log.args.tokenId
  //       ) {
  //         setMintedTo({ target: log.args.target, tokenId: log.args.tokenId });
  //       }
  //     });
  //     setMinted(true);
  //   },
  // });

  useContractEvent({
    chainId: chain,
    address: contracts.zora1155CreatorFactory,
    abi: zoraCreator1155FactoryImplABI,
    eventName: "SetupNewContract",
    listener(logs) {
      console.log({ logs });
      logs.find((log) => {
        if (
          log.eventName === "SetupNewContract" &&
          log.args.newContract &&
          log.args.creator
        ) {
          if (log.args.creator === address) {
            setMintedTo({ target: log.args.newContract, tokenId: BigInt(1) });
          }
        }
      });
    },
  });

  useContractEvent({
    chainId: chain,
    address: collection?.address,
    abi: zoraCreator1155ImplABI,
    eventName: "SetupNewToken",
    listener(logs) {
      for (const log of logs) {
        console.log({ log, type: "filter" });
        if (log.eventName === "SetupNewToken" && log.args.tokenId) {
          console.log({ log, type: "seen" });
          setMintedTo({ target: log.address, tokenId: log.args.tokenId });
        }
      }
    },
  });

  const [price, setPrice] = useState("0");

  const calls = useMemo(() => {
    if (!mintedTo || !address) {
      return ["0x"] as readonly Hex[];
    }

    const fixedPriceSalesConfig =
      CONTRACTS_BY_NETWORK[chain].fixedPriceSalesConfig;
    // step 1 setup minter permission
    const addPermission = encodeFunctionData({
      abi: zoraCreator1155ImplABI,
      functionName: "addPermission",
      args: [mintedTo.tokenId, fixedPriceSalesConfig, BigInt(2 ** 2)],
    });
    // step 2b set sales arguments
    const setSale = encodeFunctionData({
      abi: zoraCreatorFixedPriceSaleStrategyABI,
      functionName: "setSale",
      args: [
        mintedTo?.tokenId,
        {
          // start of time
          saleStart: BigInt(0),
          // 2**64 - 1 = end of time
          saleEnd: BigInt("18446744073709551615"),
          maxTokensPerAddress: BigInt(0),
          // price per token value
          pricePerToken: parseEther(price as `${number}`),
          // where these funds are sent (set to 0 on single-owner contract to keep funds in contract
          //   address on multiple-owner contract)
          fundsRecipient: address,
        },
      ],
    });
    // step 2 setup sale with new minter
    const callSale = encodeFunctionData({
      abi: zoraCreator1155ImplABI,
      functionName: "callSale",
      args: [mintedTo.tokenId, fixedPriceSalesConfig, setSale],
    });

    return [addPermission, callSale] as readonly Hex[];
  }, [mintedTo, price, address, userCollections]);

  const { write: writeSale } = useContractWrite({
    address: mintedTo?.target,
    abi: zoraCreator1155ImplABI,
    functionName: "multicall",
    args: [calls],
  });

  const zoraLink = useMemo(() => {
    if (!mintedTo || !chain) {
      return "#";
    }
    if (chain === zora.id) {
      return `https://zora.co/collections/zora:${mintedTo.target}/${mintedTo.tokenId}`;
    }
    if (chain === zoraTestnet.id) {
      return `https://testnet.zora.co/collections/zgor:${mintedTo.target}/${mintedTo.tokenId}`;
    }
    if (chain === goerli.id) {
      return `https://testnet.zora.co/collections/gor:${mintedTo.target}/${mintedTo.tokenId}`;
    }
  }, [mintedTo, chain]);

  const setSale = useCallback(() => {
    writeSale?.();
  }, [mintedTo, price]);

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
      {collection ? (
        <button
          onClick={() => setupNewToken?.()}
          disabled={
            collectionsLoading ||
            setupNewTokenLoading ||
            !setupNewToken ||
            minted
          }
        >
          Add NFT to collection
        </button>
      ) : (
        <button
          onClick={() => writeCreateContract?.()}
          disabled={
            collectionsLoading ||
            !writeCreateContract ||
            writingCreateContract ||
            minted
          }
        >
          Create P5JS Collection and Mint
        </button>
      )}
      {mintedTo && (
        <div>
          <div>
            <p>
              <strong>Minted:</strong>
            </p>
            <dl>
              <dt>Contract Address: </dt>
              <dd>{mintedTo?.target}</dd>
              <dt>Token ID: </dt>
              <dd>{mintedTo?.tokenId.toString()}</dd>
              <dt>View: </dt>
              <dd>
                <a target="_blank" href={zoraLink}>
                  View NFT on ZORA
                </a>
              </dd>
            </dl>
          </div>
          <label>
            Price:
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <button onClick={() => writeSale()} disabled={!writeSale}>
              Set Sale Price
            </button>
          </label>
        </div>
      )}
    </>
  );
};
