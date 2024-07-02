import React from "react";
import { Button } from "./ui/button";

interface ButtonSkipProps {
  onClick: () => void;
}

const ButtonSkip = React.forwardRef<HTMLButtonElement, ButtonSkipProps>(
  ({ onClick }, ref) => {
    return (
      <Button ref={ref} onClick={onClick} variant={"ghost"} className="gap-2">
        <span className="uppercase">Done with spec</span>
        <svg
          style={{ color: "slategray" }}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="icon icon-tabler icons-tabler-outline icon-tabler-player-track-next"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M3 5v14l8 -7z" />
          <path d="M14 5v14l8 -7z" />
        </svg>
      </Button>
    );
  }
);

ButtonSkip.displayName = "ButtonSkip";

export default ButtonSkip;
