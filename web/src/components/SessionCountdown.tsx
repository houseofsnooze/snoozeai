import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import NotificationTicker from "./NotificationTicker";
import { useInterval } from "@/lib/useInterval";

interface SessionCountdownProps {
  start: boolean;
  delayMilliseconds: number;
  // onDone: () => void;
}

export default function SessionCountdown({
  start,
  delayMilliseconds,
}: SessionCountdownProps) {
  const [countdown, setCountdown] = useState(delayMilliseconds / 1000);
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
    <Alert>
      <AlertTitle>Loading...</AlertTitle>
      <AlertDescription>
        {`Starting your AI agent session. ${countdown} seconds remain. Please keep this page open.`}
      </AlertDescription>
    </Alert>
  );
}
