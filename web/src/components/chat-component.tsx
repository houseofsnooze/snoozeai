import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FormEvent, useState } from "react";
import { MemoizedReactMarkdown } from "./markdown";
import { EmptyScreen } from "./empty-screen";
import { useScrollAnchor } from "@/lib/use-scroll-anchor";
import { InfoIcon } from "lucide-react";
import ButtonTrash from "./ButtonTrash";
import ButtonSend from "./ButtonSend";
import ButtonSkip from "./ButtonSkip";
import Tooltip from "./Tooltip";
import ChatStage from "./ChatStage";

import { Message } from "@/helpers/types";
import InputExpandable from "./InputExpandable";
import { Textarea } from "./ui/textarea";

export function ChatComponent({
  inputRef,
  loading,
  messages,
  onRestart,
  onSubmit,
  proceedToNextAgent,
  currentAgent,
}: {
  inputRef: React.RefObject<HTMLSpanElement>;
  loading: boolean;
  messages: Message[];
  onRestart: () => void;
  onSubmit: (message: string) => void;
  proceedToNextAgent: () => void;
  currentAgent: string;
}) {
  const [input, setInput] = useState("");
  const { containerRef, messagesRef, scrollToBottom } = useScrollAnchor();

  const handleSubmit = async () => {
    scrollToBottom();
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen mt-10">
      <div className="flex-1 p-4 overflow-auto container" ref={containerRef}>
        <div
          className="flex min-h-full flex-col gap-4 py-4 overflow-visible"
          ref={messagesRef}
        >
          {messages.length > 0 ? (
            messages.map((m, i) =>
              m.fromUser ? (
                <UserMessage key={i} message={m} />
              ) : (
                <BotMessage key={i} message={m} />
              )
            )
          ) : (
            <div className="mx-auto my-auto text-center w-full max-w-md flex items-center justify-center h-full">
              <EmptyScreen />
            </div>
          )}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-background border-t border-muted px-4 py-3 sticky bottom-0 w-full"
      >
        <div>
          <ChatStage incomingAgent={currentAgent} />
          <div className="flex space-x-2">
            <button>
              <ButtonTrash onClick={onRestart} />
            </button>
            <div className="relative w-full">
              <Textarea
                placeholder="Enter a reply..."
                disabled={loading}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {/* <InputExpandable
                inputRef={inputRef}
                disabled={loading}
              /> */}
            </div>
            <button>
              <ButtonSend onClick={handleSubmit} loading={loading} />
            </button>
            {/* <Button
              type="submit"
              className={`flex-1 text-xl uppercase font-bold shadow bg-yellow hover:bg-yellow/90 mx-2 gap-2`}
            >
              <span>Send</span>
              <SendIcon className="w-5 h-5" />
            </Button> */}
            <Tooltip content="Go to next stage">
              <ButtonSkip onClick={proceedToNextAgent} />
            </Tooltip>
          </div>
        </div>
      </form>
    </div>
  );
}

function SendIcon(props: any) {
  return (
    <svg
      {...props}
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
  );
}

const UserMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="bg-primary rounded-lg p-3 max-w-[80%] text-primary-foreground">
        <p className="text-sm">{message.message}</p>
      </div>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src="/eyes.gif" />
        <AvatarFallback>you</AvatarFallback>
      </Avatar>
    </div>
  );
};

const BotMessage = ({ message }: { message: Message }) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src="/snorlax.webp" />
        <AvatarFallback>zee</AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
        <p className="text-sm">
          <MemoizedReactMarkdown className={"prose"}>
            {message.message}
          </MemoizedReactMarkdown>
        </p>
      </div>
    </div>
  );
};
