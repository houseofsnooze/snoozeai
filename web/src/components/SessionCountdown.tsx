import { useEffect, useState } from "react";
import NotificationTicker from "./NotificationTicker";

interface SessionCountdownProps {
  start: boolean;
}

export default function SessionCountdown({ start }: SessionCountdownProps) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (start) {
      startCountdown();
    }
  }, [start]);

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

  return (
    <NotificationTicker
      notification={`Starting your AI agent session. ${countdown} seconds remain. Please keep this page open.`}
    />
  );
}
