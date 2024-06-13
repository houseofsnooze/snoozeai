import { useState } from "react";
import { Button } from "@/components/ui/button"
import FormHomeConfig from "./FormHomeConfig";
import LoadingSpinner from "./LoadingSpinner";

interface HomeButtonsProps {
    onSubmit: (addresses?: { relayAddress: string, agentAddress: string }) => void;
    setShowHeader: (show: boolean) => void;
}

export default function HomeButtons({ onSubmit, setShowHeader }: HomeButtonsProps) {
    const [loading, setLoading] = useState(false);
    const [showStartButton, setShowStartButton] = useState(true);
    const [showConfigInput, setShowConfigInput] = useState(false);

    function handleStart() {
        setLoading(true);
        setShowConfigInput(false);
        onSubmit();
    }

    function handleConfig() {
        setShowConfigInput(true);
        setShowStartButton(false);
        setShowHeader(false);
    }
    function cancelConfig() {
        setShowConfigInput(false);
        setShowStartButton(true);
        setShowHeader(true);
    }

    function submitConfig(relayAddress: string, agentAddress: string) {
        onSubmit({ relayAddress, agentAddress });
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
            {!showConfigInput && (
                <Button
                    onClick={handleConfig}
                    className="w-fit text-2xl font-bold shadow uppercase"
                    variant={"ghost"}
                >
                    Configure
                </Button>
            )}
            {showConfigInput && <FormHomeConfig onEnter={submitConfig} cancel={cancelConfig} />}
        </div>
    )
}

