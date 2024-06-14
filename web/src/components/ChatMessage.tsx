import MarkdownPreview from "@uiw/react-markdown-preview";
import React, { PropsWithRef } from "react";

interface ChatMessageProps {
  message?: string;
  fromUser: boolean;
  colorMode: string;
}

const wrapperClasses =
  "flex flex-col text-foreground items-start gap-2 rounded-lg p-1 mb-4 text-sm transition-all w-fit";
const fromUserWrapperClasses =
  "flex flex-col text-background items-start gap-2 rounded-lg p-1 mb-4 text-sm transition-all w-fit ml-auto bg-yellow";

const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, fromUser, colorMode }, ref) => {
    return (
      <div
        ref={ref}
        className={fromUser ? fromUserWrapperClasses : wrapperClasses}
      >
        <div></div>
        {fromUser ? (
          <div className="font-bold pb-2 px-2">
            <MarkdownPreview
              source={message}
              
              style={{
                background: "transparent",
                color: "unset",
                maxWidth: "50vw",
              }}
            />
          </div>
        ) : (
          <MarkdownPreview
            source={message}
            wrapperElement={{
                "data-color-mode": colorMode
              }}
            style={{
              background: "transparent",
              borderRadius: "6px",
              color: "unset",
              maxWidth: "50vw",
              paddingBottom: 10,
              paddingTop: 0,
              paddingLeft: 8,
              paddingRight: 8,
            }}
          />
        )}
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
