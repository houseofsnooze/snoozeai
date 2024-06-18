import { useEffect, useState } from "react";
import NotificationTicker from "./NotificationTicker";
import { useInterval } from "@/lib/useInterval";

interface SessionCountdownProps {
  start: boolean;
  delay: number; // seconds
  // onDone: () => void;
}

export default function SessionCountdown({
  start,
  delay,
}: SessionCountdownProps) {
  const [countdown, setCountdown] = useState(delay);
  const [period, setPeriod] = useState<number | null>(null);

  useEffect(() => {
    if (start) {
      setPeriod(1000);
    }
  }, [start]);

  useInterval(() => {
    setCountdown((prevCountdown) => {
      if (prevCountdown <= 1) {
        setPeriod(null);
        return 0;
      }
      return prevCountdown - 1;
    });
  }, period);

  return (
    <NotificationTicker
      notification={`Starting your AI agent session. ${countdown} seconds remain. Please keep this page open.`}
    />
  );
}
