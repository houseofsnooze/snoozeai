"use client";

import { useState } from "react";
import Home from "../screens/Home";
import Chat from "../screens/Chat";
import Nav from "../components/Nav";
import NotificationTicker from "../components/NotificationTicker";
import {
  CENTRAL_RELAY_URL,
  SNOOZE_AGENT_URL_KEY,
  SNOOZE_RELAY_URL_KEY,
  DUMMY_API_KEY,
} from "../helpers/constants";

export default function Main() {
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [relayAddress, setRelayAddress] = useState<string>(
    "ws://127.0.0.1:8000"
  );
  const [agentAddress, setAgentAddress] = useState<string>(
    "ws://127.0.0.1:1337"
  );
  const [snoozeApiKey, setSnoozeApiKey] = useState<string>(DUMMY_API_KEY);
  const [countdown, setCountdown] = useState(60);

  /**
   * Setup the agent session.
   * If relay and agent addresses are not set by the user,
   * use the central relay to get an agent address.
   *
   * @param addresses Relay and agent websocket urls
   */
  async function setupSession(addresses?: {
    relayAddress: string;
    agentAddress: string;
    snoozeApiKey: string;
  }) {
    console.log("Setting up session");
    setLoading(true);

    if (!addresses) {
      startCountdown();
      addresses = await requestSession();
    }

    window.localStorage.setItem(SNOOZE_RELAY_URL_KEY, addresses.relayAddress);
    window.localStorage.setItem(SNOOZE_AGENT_URL_KEY, addresses.agentAddress);
    setRelayAddress(addresses.relayAddress);
    setAgentAddress(addresses.agentAddress);
    setSnoozeApiKey(addresses.snoozeApiKey);

    setLoading(false);
    setRunning(true);
  }

  /**
   * Start a countdown for setting up the agent session.
   * When requesting from the central relay this takes less than 1 minute.
   */
  function startCountdown() {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  }

  /**
   * Request an agent session from the central relay.
   * @returns Relay and agent websocket urls
   */
  async function requestSession(): Promise<{
    relayAddress: string;
    agentAddress: string;
    snoozeApiKey: string;
  }> {
    console.log("Requesting session from central relay");
    const resp = await fetch(`https://${CENTRAL_RELAY_URL}/start`, {
      method: "POST",
    });
    const data = await resp.json();
    console.log("Received session from central relay", data);
    return {
      relayAddress: CENTRAL_RELAY_URL,
      agentAddress: data.wsUrl,
      snoozeApiKey: DUMMY_API_KEY,
    };
  }

  return (
    <div className="h-[100vh] flex justify-between flex-col">
      <Nav />
      <main className="flex h-[100vh] flex-col items-center justify-center overflow-hidden">
        {!running && <Home setupSession={setupSession} />}
        {running && (
          <Chat
            relayAddress={relayAddress}
            agentAddress={agentAddress}
            snoozeApiKey={snoozeApiKey}
          />
        )}
      </main>
      {loading && !running && (
        <NotificationTicker
          notification={`Starting your AI agent session. ${countdown} seconds remain. Please keep this page open.`}
        />
      )}
    </div>
  );
}
