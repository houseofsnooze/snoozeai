import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormHomeConfig from "./FormHomeConfig";
import LoadingSpinner from "./LoadingSpinner";

interface HomeButtonsProps {
  onSubmit: (addresses?: {
    relayAddress: string;
    agentAddress: string;
    snoozeApiKey: string;
  }) => void;
  setDelay: (delay: number) => void; // seconds
  setShowHeader: (show: boolean) => void;
}

export default function HomeButtons({
  onSubmit,
  setDelay,
  setShowHeader,
}: HomeButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [showConfigButton, setShowConfigButton] = useState(true);

  function handleStart() {
    setLoading(true);
    setDelay(90); // seconds
    setShowConfigInput(false);
    setShowConfigButton(false);
    onSubmit();
  }

  function handleConfig() {
    setShowConfigInput(true);
    setShowStartButton(false);
    setShowHeader(false);
  }
  function cancelConfig() {
    setLoading(false);
    setShowConfigInput(false);
    setShowStartButton(true);
    setShowHeader(true);
  }

  function submitConfig(
    relayAddress: string,
    agentAddress: string,
    snoozeApiKey: string
  ) {
    setLoading(true);
    setDelay(30); // seconds
    onSubmit({ relayAddress, agentAddress, snoozeApiKey });
  }

  return (
    <div className="flex flex-col gap-4">
      {showStartButton && (
        <Button
          onClick={handleStart}
          className="w-fit text-2xl font-bold shadow uppercase"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Start"}
        </Button>
      )}
      {!showConfigInput && showConfigButton && (
        <Button
          onClick={handleConfig}
          className="w-fit text-2xl font-bold shadow uppercase"
          variant={"outline"}
        >
          Configure
        </Button>
      )}
      {showConfigInput && (
        <FormHomeConfig
          onEnter={submitConfig}
          cancel={cancelConfig}
          loading={loading}
        />
      )}
    </div>
  );
}
