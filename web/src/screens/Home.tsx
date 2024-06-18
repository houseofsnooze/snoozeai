import { useState } from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
import HomeButtons from "../components/HomeButtons";

interface HomeProps {
  setupSession: (addresses?: {
    relayAddress: string;
    agentAddress: string;
    snoozeApiKey: string;
  }) => void;
  setDelay: (delay: number) => void; // seconds. this is passed upstream
}

export default function Home({ setupSession, setDelay }: HomeProps) {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <div className="container pb-6 mb-4 relative gap-4 flex place-items-center ">
      <div className="grid gap-4 flex">
        {showHeader && (
          <div className="grid grid-cols-2 gap-4">
            <h2 className="col-span-1 scroll-m-20 pb-2 text-3xl tracking-tight text-foreground">
              {
                "You want to launch on mainnet but you don't want to mess it up."
              }{" "}
              <b className="text-yellow">Snooze</b>{" "}
              {
                "turns your wildest ideas into smart contracts then tests them rigorously so you are ready for deployment."
              }
            </h2>
            <div className="col-span-1">
              <YouTubeEmbed
                videoid="vnH51OPYHiA"
                height={200}
                params="controls=0"
              />
            </div>
          </div>
        )}
        <HomeButtons
          onSubmit={setupSession}
          setDelay={setDelay}
          setShowHeader={setShowHeader}
        />
      </div>
    </div>
  );
}
