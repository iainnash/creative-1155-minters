import { ConnectKitButton } from "connectkit";

export default function Index() {
    return (
        <div>
            <ConnectKitButton />
            <div>
                Create your Sketch
                <button>
                    P5JS
                </button>
                <button>
                    ThreeJS
                </button>
                <button>
                    Hydra
                </button>
                <button>
                    Vanilla HTML/CSS
                </button>
            </div>
        </div>
    );
}