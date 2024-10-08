"use client";

import { useState } from "react";
import Home from "../screens/Home";
import Chat from "../screens/Chat";
import Nav from "../components/Nav";
import SessionCountdown from "../components/SessionCountdown";
import {
  CENTRAL_RELAY_URL,
  SNOOZE_AGENT_URL_KEY,
  SNOOZE_RELAY_URL_KEY,
  DUMMY_API_KEY,
  STARTUP_DELAY_MS,
} from "@/helpers/constants";

export default function Main() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [sessionInitiated, setSessionInitiated] = useState(false);
  const [delayMilliseconds, setDelayMilliseconds] =
    useState<number>(STARTUP_DELAY_MS);
  const [relayAddress, setRelayAddress] = useState<string>(
    "ws://127.0.0.1:8000"
  );
  const [agentAddress, setAgentAddress] = useState<string>(
    "ws://127.0.0.1:1337"
  );
  const [snoozeApiKey, setSnoozeApiKey] = useState<string>(DUMMY_API_KEY);
  const [startCountdown, setStartCountdown] = useState(false);

  /**
   * Setup the agent session.
   * If relay and agent addresses are not set by the user,
   * use the central relay to get an agent address.
   *
   * @param addresses Relay and agent websocket urls
   */
  async function setupSession(
    accessCode: string,
    addresses?: {
      relayAddress: string;
      agentAddress: string;
    }
  ) {
    console.log("Setting up session");
    setLoading(true);
    setStartCountdown(true);

    if (!addresses) {
      addresses = await requestSession(accessCode);
    }

    window.localStorage.setItem(SNOOZE_RELAY_URL_KEY, addresses.relayAddress);
    window.localStorage.setItem(SNOOZE_AGENT_URL_KEY, addresses.agentAddress);
    setRelayAddress(addresses.relayAddress);
    setAgentAddress(addresses.agentAddress);
    setSnoozeApiKey(accessCode);
    setSessionInitiated(true);
  }

  /**
   * Request an agent session from the central relay.
   * @returns Relay and agent websocket urls
   */
  async function requestSession(userId: string): Promise<{
    relayAddress: string;
    agentAddress: string;
  }> {
    console.log("Requesting session from central relay");
    const resp = await fetch(`https://${CENTRAL_RELAY_URL}/start`, {
    // const resp = await fetch(`http://localhost:8000/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
    const data = await resp.json();
    console.log("Received session from central relay", data);
    if (!resp.ok) {
      throw new Error("Request to start session failed");
    }
    return {
      relayAddress: CENTRAL_RELAY_URL,
      // relayAddress: "ws://localhost:8000",
      agentAddress: data.wsUrl,
    };
  }

  return (
    <div>
      <Nav />
      {!ready && (
        <main className="flex h-[100vh] flex-col items-center justify-center overflow-hidden">
          <Home
            setupSession={setupSession}
            setDelayMilliseconds={setDelayMilliseconds}
          />
          {!ready && loading && (
            <SessionCountdown
              delayMilliseconds={delayMilliseconds}
              start={startCountdown}
            />
          )}
        </main>
      )}
      {sessionInitiated && (
        <Chat
          relayAddress={relayAddress}
          agentAddress={agentAddress}
          snoozeApiKey={snoozeApiKey}
          onReady={() => {
            setReady(true);
          }}
        />
      )}
    </div>
  );
}
