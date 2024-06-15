"use client";

import { ErrorEvent } from "partysocket/ws";
import { useEffect, useRef, useState } from "react";
import ChatMessageContainer from "../components/ChatMessageContainer";
import { Message as MT } from "../helpers/types";
import { Socket, io } from "socket.io-client";

import ChatStage from "../components/ChatStage";
import ChatButtons from "../components/ChatButtons";

import * as parse from "../helpers/parse";
import InputExpandable from "@/components/InputExpandable";
import { Label } from "@/components/ui/label";
import { STAGES } from "@/helpers/constants";
import { ScrollArea } from "@/components/ui/scroll-area";

const messageQueue: string[] = [];
const sentMessages: string[] = [];
let currentAgent: string = "Spec Writer";
const seenAgents = new Set<string>();

interface ChatProps {
  relayAddress: string;
  agentAddress: string;
  snoozeApiKey: string;
}

export default function Chat({
  relayAddress,
  agentAddress,
  snoozeApiKey,
}: ChatProps) {
  console.log(
    "rendering Chat with: ",
    relayAddress,
    agentAddress,
    snoozeApiKey
  );
  const [messageList, setMessageList] = useState<MT[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [showStart, setShowStart] = useState(true);
  const [doneWithSpec, setDoneWithSpec] = useState(false);
  const [done, setDone] = useState(false);
  const [reset, setReset] = useState(false);

  const ws = useRef<Socket | null>(null);
  const inputRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!ws.current) {
      ws.current = io(relayAddress);
      ws.current.on("connect", onOpen);
      ws.current.on("message", onMessage);
      ws.current.on("close", onClose);
      ws.current.on("error", onError);
    }
    return () => {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, []);

  function onOpen() {
    setLoading(false);
    console.log("connected");
    requestPair();
    if (reset) {
      console.log("was reset");
      send(
        "let's start from the beginning. Ask me 'What smart contracts should we write today?' Do not precede this question with any other text"
      );
      setReset(false);
    } else {
      ready && setShowStart(true);
    }
  }

  function requestPair() {
    console.log("requestPair: ", agentAddress, snoozeApiKey);
    send("snooz3-pair" + " " + agentAddress + " " + snoozeApiKey);
  }

  async function onMessage(data: string) {
    console.log("received", data);
    console.log("current agent", currentAgent);

    if (!data) {
      return;
    }

    data = parse.removeAnsiCodes(data);

    if (data == "snooz3-pair-success") {
      setReady(true);
      return;
    }

    if (data == "snooz3-pair-error") {
      displayMessage({
        fromUser: false,
        message:
          "Error pairing with agent. Please refresh the page and try again.",
      });
      setError(true);
      return;
    }

    if (data.startsWith("snooz3-agent")) {
      console.log("agent-message: ", data);
      const encodedData = encodeURIComponent(data.replace('snooz3-agent: ', '').trim());
      const s3URL = `https://snooze-client-agent-chats-zzz--pastel-de-nata.s3.us-east-2.amazonaws.com/${encodedData}`;
      data = `Agent uploaded artifacts to S3: ${s3URL}`;
    }

    const { fromAgent, agent } = parse.checkAgentMessage(data);
    if (fromAgent) {
      console.log("prev agent", currentAgent, "next agent", agent);
      if (agent == "Client Rep") {
        return;
      }
      currentAgent = agent;
      seenAgents.add(agent);
      return;
    }

    if (data.includes("```javascript") && data.includes("const { expect }")) {
      const message = data.trim();
      displayMessage({ fromUser: false, message });
      return;
    }

    if (
      data.includes("```solidity") &&
      data.includes("pragma solidity ^0.8.0;")
    ) {
      const message = data.trim();
      displayMessage({ fromUser: false, message });
      return;
    }

    if (
      data.includes(
        "Please give feedback to Client Rep. Press enter or type 'exit' to stop the conversation:"
      ) &&
      (seenAgents.has("Test Fixer") || seenAgents.has("Test_Fixer"))
    ) {
      setDone(true);
      return;
    }

    if (!agentAvailable()) {
      // don't display
      console.log("snz3 - no agent available", currentAgent);
      return;
    }

    if (data.includes("Response from calling tool")) {
      console.log("snz3 - tool response");
      console.log("about to shift message queue", messageQueue);
      // ignore
      messageQueue.shift();
      messageQueue.push("snz3:tool_response");
      return;
    }

    if (!parse.isFirstCharAlphanumeric(data)) {
      // ignore
      console.log(data);
      console.log("snz3 - not alphanumeric");
      return;
    } else {
      const message = data.trim();

      if (message == sentMessages.pop()) {
        // this is the user's message
        return;
      }

      if (message == "start from the top") {
        // ignore
        return;
      }

      console.log("about to shift message queue", messageQueue);
      const lastMessage = messageQueue.shift();
      messageQueue.push(message);

      if (message.includes("snz3:tool_response")) {
        // don't display
        return;
      }

      if (lastMessage == "snz3:tool_response") {
        // don't display
        return;
      }

      if (message == "null") {
        // don't display
        return;
      }

      if (parse.startsWithArguments(message)) {
        // don't display
        return;
      }

      if (parse.startsWithProvideFeeback(message)) {
        // first, check last message

        if (lastMessage) {
          if (parse.startsWithArguments(lastMessage)) {
            // skip and don't display
            sendSkip();
            return;
          } else {
            return;
          }
        } else {
          // don't display
          return;
        }
      }

      displayMessage({ fromUser: false, message });
      return;
    }
  }

  function onClose(e: CloseEvent) {
    console.log("ws is closed with code: " + e.code + " reason: " + e.reason);
    console.log("closed");
  }

  function onError(e: ErrorEvent) {
    console.log("error");
    setLoading(true);
  }

  function sendSkip() {
    console.log("snz3 - sending skip");
    setLoading(true);
    if (!ws) {
      console.error("missing ws");
    }
    send("");
  }

  function displayMessage(message: MT) {
    if (message.message.includes("# User story")) {
      setDoneWithSpec(true);
    }
    const lastMessageInList = messageList[messageList.length - 1];
    if (lastMessageInList) {
      console.log("first", message.message);
      console.log("last", lastMessageInList.message);
      if (message.message == lastMessageInList.message) {
        return;
      }
    }
    setMessageList((prev) => [...prev, message]);
    setLoading(false);
  }

  function handleEnter() {
    console.log("snz3 - handle enter");
    setLoading(true);
    const message = inputRef.current?.innerText || "";
    setMessageList((prev) => [...prev, { fromUser: true, message }]);
    send(message);
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
  }

  function proceedToNextAgent() {
    setDoneWithSpec(false);
    setLoading(true);
    send("exit");
    if (currentAgent.includes("Test") && currentAgent.includes("Reviewer")) {
      setDone(true);
    }
  }

  function restart() {
    send("snooz3-restart");
    setMessageList([]);
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
    setLoading(true);
    setDone(false);
    messageQueue.length = 0;
    sentMessages.length = 0;
    setReset(true);
  }

  function send(message: string) {
    console.log("sending", message);
    ws.current?.send(message);
    sentMessages.push(message);
  }

  function agentAvailable() {
    // return true;
    return (
      currentAgent.includes("Spec") ||
      currentAgent.includes("Contract Reviewer") ||
      currentAgent.includes("Fixer")
    );
  }

  return (
    <div className="">
      <ChatStage agent={currentAgent} />
      <div className="grid gap-4 max-w-5xl w-[100%] p-10">
        <div
          style={{
            height: "500px",
            overflowY: "scroll",
          }}
        >
          <ChatMessageContainer messageList={messageList} />
        </div>
        <div>
          {done && (
            <h2 className="scroll-m-20 pb-2 text-3xl tracking-tight first:mt-0 text-gray-400">
              {"Done! Now you can catch some zzzs 😴"}
            </h2>
          )}
          <div className="ml-auto min-w-[300px] w-1/3">
            <div className={"grid gap-4" + (done ? " hidden" : "")}>
              <Label className="font-light text-muted-foreground">
                {messageList.length == 0
                  ? "What contracts do you want for your project?"
                  : "Enter a reply..."}
              </Label>
              <InputExpandable inputRef={inputRef} />
              <ChatButtons
                restart={restart}
                agentAvailable={agentAvailable}
                doneWithSpec={doneWithSpec}
                handleEnter={handleEnter}
                loading={loading}
                proceedToNextAgent={proceedToNextAgent}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
