import { ConnectKitButton } from "connectkit";
import { useRouter } from "next/router";

export default function Index() {
  const { push } = useRouter();
  return (
    <div className="p-8">
      <ConnectKitButton />
      <div>
        <h3>Create your Sketch</h3>
        <button onClick={() => push(`/p5js/create`)}>P5JS</button>
        <button>ThreeJS</button>
        <button>Hydra</button>
        <button>Vanilla HTML/CSS</button>
      </div>
    </div>
  );
}
