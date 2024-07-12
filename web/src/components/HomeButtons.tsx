import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormHomeConfig from "./FormHomeConfig";
import FormHomeStart from "./FormHomeStart";
import LoadingSpinner from "./LoadingSpinner";
import * as api from "../lib/api";
import { CONFIG_STARTUP_DELAY_MS, STARTUP_DELAY_MS } from "@/helpers/constants";

interface HomeButtonsProps {
  onSubmit: (
    accessCode: string,
    addresses?: {
      relayAddress: string;
      agentAddress: string;
    }
  ) => void;
  setDelayMilliseconds: (delay: number) => void;
  setShowHeader: (show: boolean) => void;
}

export default function HomeButtons({
  onSubmit,
  setDelayMilliseconds,
  setShowHeader,
}: HomeButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [showStartInput, setShowStartInput] = useState(false);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [showConfigButton, setShowConfigButton] = useState(true);

  function handleStart() {
    setShowStartInput(true);
    setShowConfigButton(false);
  }
  function cancelStart() {
    setLoading(false);
    setShowStartInput(false);
    setShowStartButton(true);
    setShowConfigButton(true);
  }

  async function submitStart({
    emailAddress,
    telegramHandle,
    accessCode,
  }: {
    emailAddress: string;
    telegramHandle: string;
    accessCode: string;
  }) {
    setLoading(true);
    const user = { email: emailAddress, telegramHandle: telegramHandle };
    const saved = await api.saveUser(user);
    if (!saved) {
      console.error("Failed to save user");
      return;
    }
    const valid = await api.checkValidAccessCode(accessCode);
    if (!valid) {
      alert("Invalid access code");
      return;
    }
    setDelayMilliseconds(STARTUP_DELAY_MS);
    setShowStartInput(false);
    onSubmit(accessCode);
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

  async function submitConfig(
    relayAddress: string,
    agentAddress: string,
    accessCode: string
  ) {
    setLoading(true);
    setDelayMilliseconds(CONFIG_STARTUP_DELAY_MS);
    setShowConfigInput(false);
    if (window.location.hostname !== "localhost") {
      const valid = await api.checkValidAccessCode(accessCode);
      if (!valid) {
        console.error("Invalid access code");
        return;
      }
    }
    onSubmit(accessCode, { relayAddress, agentAddress });
  }

  return (
    <div className="flex flex-col gap-4 w-fit">
      {showStartButton && !showStartInput && (
        <Button
          onClick={handleStart}
          className="w-fit text-2xl font-bold shadow uppercase"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Start"}
        </Button>
      )}
      {showStartInput && (
        <FormHomeStart
          onEnter={submitStart}
          cancel={cancelStart}
          loading={loading}
        />
      )}
      {!showConfigInput && showConfigButton && (
        <Button
          onClick={handleConfig}
          className="w-fit text-2xl font-bold shadow uppercase"
          variant={"outline"}
        >
          {loading ? <LoadingSpinner /> : "Configure"}
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
