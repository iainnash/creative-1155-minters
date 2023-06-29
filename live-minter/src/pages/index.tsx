import { useCallback, useEffect, useRef, useState } from "react";

const TIME_BETWEEN_MINTS = 60 * 5;

function getZoraFrameURL() {
  return `https://testnet.zora.co/collections/zgor:${process.env.NEXT_PUBLIC_MINTER_TARGET_CONTRACT}`;
}

async function getMints() {
  const mints = await fetch("/api/mints");
  return await mints.json();
}

export default function IndexPage() {
  const [mintCountdown, setMintCountdown] = useState(TIME_BETWEEN_MINTS);
  const [mints, setMints] = useState([]);
  const nftsFrame = useRef(null);
  const updateMints = useCallback(async () => {
    const mints = await getMints();
    if (mints.length) {
      setMints(mints);
    }
  }, [setMints]);
  useEffect(() => {
    updateMints();
  }, []);
  const mint = async () => {
    const frame = document.getElementById("sketch") as HTMLIFrameElement;
    const canvas = frame.contentDocument!.body.querySelector("canvas");
    const png = canvas?.toDataURL("image/png");
    const minted = await fetch("/api/mint", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({ png }),
    });
    if (nftsFrame.current) {
      (nftsFrame.current as any).src = "about:blank";
      (nftsFrame.current as any).src = getZoraFrameURL();
    }
    console.log(await minted.json());
    updateMints();
  };
  const updateMinter = useCallback(() => {
    let newMintCountdown = mintCountdown - 1;
    if (mintCountdown === 0) {
      newMintCountdown = TIME_BETWEEN_MINTS;
      mint();
    }
    setMintCountdown(newMintCountdown);
  }, [mint]);
  useEffect(() => {
    const interval = setInterval(updateMinter, 1000);
    return () => {
      clearInterval(interval);
    };
  });
  return (
    <div
      style={{ display: "flex", fontFamily: "helvetica", fontSize: "1.2em" }}
    >
      <iframe
        frameBorder={0}
        style={{ width: "100%", height: "100vh" }}
        src="/drawer/index.html"
        id="sketch"
      ></iframe>
      <div style={{ minWidth: "500px" }}>
        <div>
          Mint NFT Countdown: {Math.floor(mintCountdown / 60)}:
          {(mintCountdown % 60)}
        </div>
        <div style={{ display: 'grid', width: "100%", height: '100%', overflow: 'scroll' }}>
          {mints
            .filter((mint: any) => mint?.metadata?.image)
            .map((mint: any) => (
              <div>
                <div style={{fontSize: '0.04em', width: '100%'}}>
                  {new Date(parseInt(mint.timestamp) * 1000).toString()}
                </div>
                <img style={{width: '400px'}} src={mint.metadata?.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} />
              </div>
            ))}
          {/* <iframe
            style={{ height: "90vh", width: "100%" }}
            src={getZoraFrameURL()}
          ></iframe> */}
        </div>
      </div>
    </div>
  );
}
