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
import FormDownload from "./FormDownload";

import { Message } from "@/helpers/types";
import InputExpandable from "./InputExpandable";
import { Textarea } from "./ui/textarea";
import { AGENTS } from "@/helpers/constants";

export function ChatComponent({
  inputRef,
  loading,
  messages,
  onRestart,
  onSubmit,
  proceedToNextAgent,
  currentAgent,
  done,
  downloadURL,
}: {
  inputRef: React.RefObject<HTMLSpanElement>;
  loading: boolean;
  messages: Message[];
  onRestart: () => void;
  onSubmit: (message: string) => void;
  proceedToNextAgent: () => void;
  currentAgent: string;
  done: boolean;
  downloadURL: string;
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
                <BotMessage
                  key={i}
                  message={m}
                  agentChatter={currentAgent != AGENTS["Spec Writer"]}
                />
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
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="bg-background border-t border-muted px-4 py-3 sticky bottom-0 w-full"
      >
        {done && (
          <FormDownload>
            <div className="container">
              <Button
                className="w-full uppercase"
                onClick={() => {
                  window.open(downloadURL, "_blank");
                }}
              >
                Download Spec & Code
              </Button>
            </div>
          </FormDownload>
        )}
        {!done && (
          <div className="container">
            <ChatStage incomingAgent={currentAgent} />
            <div className="flex space-x-2">
              <div className="relative w-full">
                <Textarea
                  placeholder={
                    currentAgent != AGENTS["Spec Writer"]
                      ? "The agents are talking to each other! Feel free to take a nap while they finish up."
                      : "Enter a reply..."
                  }
                  disabled={loading || currentAgent != AGENTS["Spec Writer"]}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              {currentAgent === AGENTS["Spec Writer"] && (
                <>
                  <div>
                    <ButtonSend onClick={handleSubmit} loading={loading} />
                  </div>
                  <div>
                    <ButtonSkip onClick={proceedToNextAgent} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
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

const BotMessage = ({
  message,
  agentChatter,
}: {
  message: Message;
  agentChatter: boolean;
}) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src="/snorlax.webp" />
        <AvatarFallback>zee</AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-lg p-3 max-w-[80%]">
        <p className={`text-sm ${agentChatter ? "text-muted-foreground" : ""}`}>
          <MemoizedReactMarkdown className={"prose"}>
            {message.message}
          </MemoizedReactMarkdown>
        </p>
      </div>
    </div>
  );
};
