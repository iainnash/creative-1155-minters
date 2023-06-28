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
        <button onClick={() => push(`/vanilla/create`)}>HTML/CSS Webpage</button>
      </div>
    </div>
  );
}
