import { useState } from "react";
import { YouTubeEmbed } from "@next/third-parties/google";
import HomeButtons from "../components/HomeButtons";

interface HomeProps {
  setupSession: (
    accessCode: string,
    addresses?: {
      relayAddress: string;
      agentAddress: string;
    }
  ) => void;
  setDelay: (delay: number) => void; // seconds. this is passed upstream
}

export default function Home({ setupSession, setDelay }: HomeProps) {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <div className="container pb-6 mb-4 relative gap-4 flex place-items-center ">
      <div className="grid gap-4 flex">
        {showHeader && (
          <div className="grid grid-cols-2 gap-4">
            <h1 className="col-span-1 text-6xl tracking-tight text-foreground">
              <b className="text-yellow">snooze</b>{" "}
              {"turns your ideas into smart contracts"}
            </h1>
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
