import { useState } from "react";
import { Button } from "@/components/ui/button"
import FormHomeConfig from "./FormHomeConfig";
import LoadingSpinner from "./LoadingSpinner";

interface HomeButtonsProps {
    onSubmit: (addresses?: { relayAddress: string, agentAddress: string }) => void;
}

export default function HomeButtons({ onSubmit }: HomeButtonsProps) {
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
    }

    function submitConfig(relayAddress: string, agentAddress: string) {
        onSubmit({ relayAddress, agentAddress });
    }

    return (
        <div className="flex flex-col gap-4">
            {showStartButton && (
                <Button
                    onClick={handleStart}
                    className="w-fit text-2xl font-bold shadow"
                    disabled={loading}
                >
                    {loading ? <LoadingSpinner /> : "START"}
                </Button>
            )}
            {!showConfigInput && (
                <Button
                    onClick={handleConfig}
                    className="w-fit text-2xl font-bold shadow text-gray-400"
                    variant={"secondary"}
                >
                    CONFIGURE
                </Button>
            )}
            {showConfigInput && <FormHomeConfig onEnter={submitConfig} />}
        </div>
    )
}

