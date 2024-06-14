import { useState } from "react";
import HomeButtons from "../components/HomeButtons";

interface HomeProps {
    setupSession: (addresses?: { relayAddress: string, agentAddress: string }) => void;
}

export default function Home({ setupSession }: HomeProps) {
    const [showHeader, setShowHeader] = useState(true);

    return (
        <div className="pb-6 mb-4 relative w-[1000px] gap-4 flex place-items-center ">
            <div className="grid gap-4 flex">
                {showHeader && <h2 className="scroll-m-20 pb-2 text-3xl tracking-tight first:mt-0 text-foreground">
                    {"You want to launch on mainnet but you don't want to mess it up."} <br /> <b className="text-yellow">Snooze</b> {"turns your wildest ideas into smart contracts then tests them rigorously so you are ready for deployment."}
                </h2>}
                <HomeButtons onSubmit={setupSession} setShowHeader={setShowHeader} />
            </div>
        </div>
    )
}
