import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";

interface ButtonNextProps {
    loading: boolean;
    onClick: () => void;
}

const ButtonNext = React.forwardRef<HTMLButtonElement, ButtonNextProps>(({ onClick, loading }, ref) => {
    return (
        <Button
            ref={ref}
            onClick={onClick}
            className={`flex-1 text-xl font-bold shadow bg-yellow hover:bg-yellow/90 mx-2`}
            disabled={loading}
        >
            {loading ? <LoadingSpinner /> : "NEXT"}
        </Button>
    )
});

ButtonNext.displayName = "ButtonNext";

export default ButtonNext;
