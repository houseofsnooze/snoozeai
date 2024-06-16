import ButtonNext from "../components/ButtonNext";
import ButtonSkip from "../components/ButtonSkip";
import ButtonSend from "../components/ButtonSend";
import ButtonTrash from "../components/ButtonTrash";
import Tooltip from "./Tooltip";
import { Label } from "./ui/label";
import LoadingSpinner from "./LoadingSpinner";

interface ChatButtonsProps {
  loading: boolean;
  restart: () => void;
  agentAvailable: () => boolean;
  handleEnter: () => void;
  proceedToNextAgent: () => void;
}

export default function ChatButtons({
  loading,
  restart,
  agentAvailable,
  handleEnter,
  proceedToNextAgent,
}: ChatButtonsProps) {
  return (
    <div className="w-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors ml-auto">
      <Tooltip content="Restart">
        <ButtonTrash onClick={restart} />
      </Tooltip>
      {agentAvailable() ? (
        <>
          <ButtonSend onClick={handleEnter} loading={loading} />
          <Tooltip content="Go to next stage">
            <ButtonSkip onClick={proceedToNextAgent} />
          </Tooltip>
        </>
      ) : (
        <>
          <Label className="font-light text-muted-foreground">
            This will take a few minutes...
          </Label>
          <LoadingSpinner />
        </>
      )}
    </div>
  );
}
