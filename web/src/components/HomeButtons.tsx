import { useState } from "react";
import { Button } from "@/components/ui/button";
import FormHomeConfig from "./FormHomeConfig";
import FormHomeStart from "./FormHomeStart";
import LoadingSpinner from "./LoadingSpinner";
import * as api from "../lib/api";

interface HomeButtonsProps {
  onSubmit: (
    accessCode: string,
    addresses?: {
      relayAddress: string;
      agentAddress: string;
    }
  ) => void;
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
  const [showStartInput, setShowStartInput] = useState(false);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [showConfigButton, setShowConfigButton] = useState(true);

  function handleStart() {
    setShowStartInput(true);
    setShowStartButton(false);
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
    setDelay(90); // seconds
    setShowStartInput(false);
    setShowConfigButton(false);
    const user = { email: emailAddress, telegramHandle: telegramHandle };
    const saved = await api.saveUser(user);
    if (!saved) {
      console.error("Failed to save user");
      return;
    }
    const valid = await api.checkValidAccessCode(accessCode);
    if (!valid) {
      console.error("Invalid access code");
      return;
    }
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
    setDelay(30); // seconds
    setShowConfigInput(false);
    const valid = await api.checkValidAccessCode(accessCode);
    if (!valid) {
      console.error("Invalid access code");
      return;
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
