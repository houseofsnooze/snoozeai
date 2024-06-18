"use client";

import { ErrorEvent } from "partysocket/ws";
import { useEffect, useRef, useState } from "react";
import ChatMessageContainer from "../components/ChatMessageContainer";
import { Message as MT } from "../helpers/types";
import { Socket, io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import ChatStage from "../components/ChatStage";
import ChatButtons from "../components/ChatButtons";

import * as parse from "../helpers/parse";
import InputExpandable from "@/components/InputExpandable";
import { Label } from "@/components/ui/label";

import "../style/Chat.css";

const initialStates = {
  messageQueue: [],
  sentMessages: [],
  seenAgents: new Set<string>(),
  // react states
  currentAgent: "Spec Writer",
  messageList: [],
  downloadURL: "",
  loading: true,
  ready: false,
  done: false,
  reset: false,
};

const messageQueue: string[] = Object.assign(initialStates.messageQueue);
const sentMessages: string[] = Object.assign(initialStates.sentMessages);
const seenAgents = Object.assign(initialStates.seenAgents);

interface ChatProps {
  relayAddress: string;
  agentAddress: string;
  snoozeApiKey: string;
  onReady: () => void;
}

export default function Chat({
  relayAddress,
  agentAddress,
  snoozeApiKey,
  onReady,
}: ChatProps) {
  console.log(
    "rendering Chat with: ",
    relayAddress,
    agentAddress,
    snoozeApiKey
  );
  const [loading, setLoading] = useState<boolean>(initialStates.loading);
  const [ready, setReady] = useState<boolean>(initialStates.ready);
  const [reset, setReset] = useState<boolean>(initialStates.reset);
  const [done, setDone] = useState<boolean>(initialStates.done);
  const [currentAgent, setCurrentAgent] = useState<string>(
    initialStates.currentAgent
  );
  const [downloadURL, setDownloadURL] = useState<string>(
    initialStates.downloadURL
  );
  const [messageList, setMessageList] = useState<MT[]>(
    initialStates.messageList
  );

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
    }
  }

  function requestPair() {
    console.log("requestPair will start after delay: ", agentAddress, snoozeApiKey);
    setTimeout(() => {
      console.log("requestPair: 30 seconds passed");
      console.log("requestPair: sending pair request to relay");
      send("snooz3-pair" + " " + agentAddress + " " + snoozeApiKey);
      setReady(true);
      onReady();
    }, 30000);
    setTimeout(() => {
      send("hi")
    }, 1000);
  }

  // NOTE: The websocket handlers are only constructed once so
  // they can not read React state correctly.
  // Do not rely on state variables for logic here such as "currentAgent".
  // However setting state from here works fine.
  async function onMessage(data: string) {
    console.log("onMessage received:", data);

    if (!data) {
      return;
    }

    data = parse.removeAnsiCodes(data);

    // HIDE
    // Message indicates pairing was successful
    if (data == "snooz3-pair-success") {
      return;
    }

    // SHOW
    // Message indicates pairing failed
    if (data == "snooz3-pair-error") {
      displayMessage({
        fromUser: false,
        message:
          "Error pairing with agent. Please refresh the page and try again.",
      });
      return;
    }

    // SHOW
    // Message indicates agent uploaded artifacts to S3
    if (data.startsWith("snooz3-agent")) {
      console.log("agent-message: ", data);
      const encodedData = encodeURIComponent(
        data.replace("snooz3-agent: ", "").trim()
      );
      const s3URL = `https://snooze-client-agent-chats-zzz--pastel-de-nata.s3.us-east-2.amazonaws.com/${encodedData}`;
      setDownloadURL(s3URL);
      displayMessage({
        fromUser: false,
        message: `Done! You can now download the spec & code [here](${s3URL}).`,
      });
      setDone(true);
      return;
    }

    // HIDE
    // Message starts with "Arguments" related to tool call
    if (data.startsWith("Arguments")) {
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

    const { fromAgent, sender, recipient } = parse.checkSpeakerMessage(data);

    // HIDE
    // Message specifies the sender and recipient of the next message e.g. "Client (to Client Rep):"
    if (fromAgent) {
      if (sender.includes("Client")) {
        return;
      }
      setCurrentAgent(sender);
      seenAgents.add(sender);
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
    if (message.startsWith("Starting a new chat..")) {
      return;
    }

    // HIDE
    // Message is empty
    if (message == "") {
      return;
    }

    // HIDE
    // Message is our hardcoded prompt
    if (message.startsWith("Help me to elaborate")) {
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
    setLoading(true);
    send("exit");
    if (currentAgent.includes("Test Reviewer")) {
      setDone(true);
    }
  }

  function restart() {
    send("snooz3-restart");
    if (inputRef.current) {
      inputRef.current.innerText = "";
    }
    messageQueue.length = 0;
    sentMessages.length = 0;
    seenAgents.clear();
    // reset react states
    setLoading(initialStates.loading);
    setReset(initialStates.reset);
    setDone(initialStates.done);
    setCurrentAgent(initialStates.currentAgent);
    setDownloadURL(initialStates.downloadURL);
    setMessageList(initialStates.messageList);
  }

  function send(message: string) {
    console.log("sending", message);
    ws.current?.send(message);
    sentMessages.push(message.trim());
  }

  function agentAvailable() {
    return currentAgent == "Spec Writer";
  }

  if (ready) {
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
            <Button className="w-full uppercase">
              <a href={downloadURL}>Download Spec & Code</a>
            </Button>
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
                handleEnter={handleEnter}
                loading={loading}
                proceedToNextAgent={proceedToNextAgent}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
}
