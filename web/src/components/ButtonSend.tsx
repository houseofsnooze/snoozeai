import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";

interface ButtonSendProps {
    onClick: () => void;
    loading: boolean;
    color: "yellow" | "accent";
}

export const ButtonSend = React.forwardRef<HTMLButtonElement, ButtonSendProps>(({ onClick, loading, color }, ref) => {
    return (
        <Button
            ref={ref}
            onClick={onClick}
            className={`flex-1 text-xl font-bold shadow bg-${color} hover:bg-yellow/90 mx-2`}
            disabled={loading}
        >
            {loading ? <LoadingSpinner /> : "SEND"}
        </Button>
    )
});
