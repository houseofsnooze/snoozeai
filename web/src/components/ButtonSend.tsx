import React from "react";
import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";

interface ButtonSendProps {
  onClick: () => void;
  loading: boolean;
}

const ButtonSend = React.forwardRef<HTMLButtonElement, ButtonSendProps>(
  ({ onClick, loading }, ref) => {
    return (
      <Button
        ref={ref}
        onClick={onClick}
        className={`flex-1 text-xl uppercase font-bold shadow bg-yellow hover:bg-yellow/90 mx-2`}
        disabled={loading}
      >
        {loading ? <LoadingSpinner /> : "Send"}
      </Button>
    );
  }
);

ButtonSend.displayName = "ButtonSend";

export default ButtonSend;
