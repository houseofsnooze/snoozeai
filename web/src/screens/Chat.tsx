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

const messageQueue: string[] = [];
const sentMessages: string[] = [];
// Using Spec Writer for the first agent to set chat stage correctly
let currentAgent: string = "Spec Writer";
let previousAgent: string = "Client";
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
    console.log("onMessage received:", data);
    console.log("onMessage current agent:", currentAgent);

    if (!data) {
      return;
    }

    data = parse.removeAnsiCodes(data);

    // HIDE
    // Message indicates pairing was successful
    if (data == "snooz3-pair-success") {
      setReady(true);
      return;
    }

    // HIDE
    // Message indicates pairing failed
    if (data == "snooz3-pair-error") {
      displayMessage({
        fromUser: false,
        message:
          "Error pairing with agent. Please refresh the page and try again.",
      });
      setError(true);
      return;
    }

    // HIDE
    // Message specifies the sender and recipient of the next message e.g. "Client (to Client Rep):"
    const { fromAgent, agent } = parse.checkSpeakerMessage(data);
    if (fromAgent) {
      console.log(
        "prev sender:",
        previousAgent,
        "curr sender:",
        currentAgent,
        "next sender:",
        agent
      );
      // Do not set current agent as client rep or client because it is used for the chat stage
      // TODO: fix the aforementioned logic to make this less fragile
      if (agent.includes("Client")) {
        return;
      }
      previousAgent = currentAgent;
      currentAgent = agent;
      seenAgents.add(agent);
      return;
    }

    // SHOW
    // Message has js code
    if (data.includes("```javascript") && data.includes("const { expect }")) {
      const message = data.trim();
      displayMessage({ fromUser: false, message });
      return;
    }

    // SHOW
    // Message has solidity
    if (
      data.includes("```solidity") &&
      data.includes("pragma solidity ^0.8.0;")
    ) {
      const message = data.trim();
      displayMessage({ fromUser: false, message });
      return;
    }

    // HIDE
    // Message asks for user input
    // TODO: this should probably check last from/to agent was Test Fixer instead of seen
    if (
      data.includes(
        "Please give feedback to Client Rep. Press enter or type 'exit' to stop the conversation:"
      ) &&
      seenAgents.has("Test Fixer")
    ) {
      setDone(true);
      return;
    }

    // HIDE
    // Message is to an agent and we don't want the user to interrupt
    if (!agentAvailable()) {
      console.log("snz3 - no agent available", currentAgent);
      return;
    }

    // HIDE
    // Message is a tool response
    // We want to capture this so that we know to send a skip for the next message
    if (data.includes("Response from calling tool")) {
      console.log("snz3 - tool response");
      console.log("about to shift message queue", messageQueue);
      messageQueue.shift();
      messageQueue.push("snz3:tool_response");
      return;
    }

    // HIDE
    // Messsage is a delimiter
    if (!parse.isFirstCharAlphanumeric(data)) {
      console.log("snz3 - not alphanumeric");
      return;
    }

    const message = data.trim();

    // HIDE
    // Message is from user
    console.log("sentMessages", sentMessages);
    if (message == sentMessages[sentMessages.length - 1]) {
      sentMessages.pop();
      return;
    }

    // HIDE
    // Message indicates a new stage
    // TODO: might be helpful to capture this to support filtering logic?
    if (message == "Starting a new chat...") {
      return;
    }

    // HIDE
    // Message is empty
    if (message == "") {
      return;
    }

    // HIDE
    // The first message we want to display has not been received yet
    if (
      messageQueue.length == 0 &&
      !message.startsWith("Describe your smart contract")
    ) {
      return;
    }

    // Capture the message in the queue and return the top of the queue
    console.log("about to shift message queue", messageQueue);
    const lastMessage = messageQueue.shift();
    messageQueue.push(message);

    // HIDE
    // Last message indicated a tool response was coming and this message is the actual response to ignore
    // Note: We don't want to ignore code outputs so we check for that before this line
    if (lastMessage == "snz3:tool_response") {
      return;
    }

    // HIDE
    // Message starts with "Arguments" related to tool call
    if (parse.startsWithArguments(message)) {
      return;
    }

    // HIDE
    // Message asks for user input
    // Check if it is waiting for the user to confirm a tool call and if so send a skip
    // TODO: maybe use this to set a variable if the "to" is Client and then show the input field
    if (parse.startsWithProvideFeeback(message)) {
      if (lastMessage) {
        if (parse.startsWithArguments(lastMessage)) {
          sendSkip();
          return;
        }
      }
      return;
    }

    displayMessage({ fromUser: false, message });
    return;
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
    sentMessages.push(message.trim());
  }

  function agentAvailable() {
    // return true;
    return (
      currentAgent.includes("Spec") ||
      currentAgent.includes("Contract Reviewer") ||
      currentAgent.includes("Test Fixer")
    );
  }

  return (
    <div className="container flex flex-col justify-between center h-[100%] my-12">
      <ChatStage incomingAgent={currentAgent} />
      <div className="grid gap-4 w-[100%] p-10">
        <div
          className="max-h-[500px]"
          style={{
            overflowY: "scroll",
          }}
        >
          <ChatMessageContainer messageList={messageList} />
        </div>
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
  );
}
