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
        className={`flex-1 text-xl uppercase font-bold shadow bg-yellow hover:bg-yellow/90 mx-2 gap-2`}
        disabled={loading}
      >
        <span>{loading ? <LoadingSpinner /> : "Send"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
      </Button>
    );
  }
);

ButtonSend.displayName = "ButtonSend";

export default ButtonSend;
