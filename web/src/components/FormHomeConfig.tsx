"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "./LoadingSpinner";

interface FormHomeConfigProps {
  onEnter: (
    relayAddress: string,
    agentAddress: string,
    snoozeApiKey: string
  ) => void;
  cancel: () => void;
  loading: boolean;
}

export default function FormHomeConfig({
  onEnter,
  cancel,
  loading,
}: FormHomeConfigProps) {
  const relayAddress = useRef<HTMLInputElement>(null);
  const agentAddress = useRef<HTMLInputElement>(null);
  const snoozeApiKey = useRef<HTMLInputElement>(null);

  function handleClick() {
    if (relayAddress.current && agentAddress.current && snoozeApiKey.current) {
      onEnter(
        relayAddress.current.value,
        agentAddress.current.value,
        snoozeApiKey.current.value
      );
    }
    return;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Relay address
        </label>
        <Input
          className="text-xl"
          ref={relayAddress}
          placeholder="ws://127.0.0.1:8000"
          defaultValue="ws://127.0.0.1:8000"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Agent address
        </label>
        <Input
          className="text-xl"
          ref={agentAddress}
          placeholder="ws://127.0.0.1:1337"
          defaultValue="ws://127.0.0.1:1337"
        />
        <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Snooze api key
        </label>
        <Input
          className="text-xl"
          ref={snoozeApiKey}
          placeholder="123e4567-e89b-12d3-a456-426614174000"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={cancel}
          className="w-fit text-2xl font-bold shadow uppercase"
          variant={"outline"}
        >
          Cancel
        </Button>
        <Button
          onClick={handleClick}
          className="w-fit text-2xl font-bold shadow uppercase"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Enter"}
        </Button>
      </div>
    </div>
  );
}
