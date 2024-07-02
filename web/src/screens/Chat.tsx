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
import { ChatComponent } from "@/components/chat-component";

const initialStates = {
  messagesToTrack: [],
  sentMessages: [],
  receivedAndDisplayedMessages: [],
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

const messagesToTrack: string[] = Object.assign(initialStates.messagesToTrack);
const receivedAndDisplayedMessages: string[] = Object.assign(
  initialStates.receivedAndDisplayedMessages
);
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
    console.log(
      "requestPair will start after delay: ",
      agentAddress,
      snoozeApiKey
    );
    setTimeout(() => {
      console.log("requestPair: 30 seconds passed");
      console.log("requestPair: sending pair request to relay");
      send("snooz3-pair" + " " + agentAddress + " " + snoozeApiKey);
      setReady(true);
      onReady();
      setTimeout(() => {
        console.log("requestPair: 5 seconds passed")
        console.log(`messageList = ${messageList}`);
        if (messageList.length === 0) {
          console.log('messageList length === 0');
          // console.log('request restart connection to agent');
          // restart();
        }
      }, 5000);
    }, 45000);
  }

  // IMPORTANT: Do not rely on React state variables for logic in
  // these websocket handlers.
  //
  // The websocket handlers are only constructed once so they can not
  // read React state correctly.
  // For example, "currentAgent" will not be correct here.
  //
  // However setting React state from here works fine.
  async function onMessage(data: string) {
    console.log("onMessage received:", data);

    if (!data) {
      return;
    }

    // Strip colors but don't ignore their data in case they are
    // things we want to track like tool calls
    const { output, replaced } = parse.removeAnsiCodes(data);
    data = output;
    const hadAnsiCodes = replaced;

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
        custom: true,
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
        custom: true,
      });
      setDone(true);
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
    // Message is a debug log with sender and recipient
    //
    // e.g. "Client (to Client Rep):"
    if (fromAgent) {
      if (sender.includes("Client")) {
        return;
      }
      setCurrentAgent(sender);
      seenAgents.add(sender);
      return;
    }

    // --------------------------------------
    // Below we filter on the trimmed message
    // --------------------------------------

    const message = data.trim();

    // HIDE
    // Message is empty
    if (message == "") {
      return;
    }

    // HIDE
    // Message is from user
    if (sentMessages.length > 0) {
      if (message.trim() == sentMessages[sentMessages.length - 1].trim()) {
        console.log("sentMessages", sentMessages);
        sentMessages.pop();
        return;
      }
    }

    // HIDE
    // Message indicates a new stage
    //
    // TODO: might be helpful to capture this as a new chat between
    // different agents to support filtering logic?
    if (message.startsWith("Starting a new chat..")) {
      return;
    }

    // HIDE
    // Message is our hardcoded prompt
    if (message.startsWith("Help me to elaborate")) {
      return;
    }

    // HIDE
    // Message is a tool response
    //
    // We capture this so that we know to ignore the next message
    //
    // NOTE: Before this line we check for code snippets so that
    // we always display code.
    if (message.includes("Response from calling tool")) {
      console.log("snz3 - tool response");
      console.log("about to shift messagesToTrack", messagesToTrack);
      messagesToTrack.shift();
      messagesToTrack.push("snz3:tool_response");
      return;
    }

    // HIDE
    // Message starts with "Arguments"
    //
    // We capture this so we know to send a skip after the next message
    if (parse.startsWithArguments(message)) {
      console.log("snz3 - found arguments");
      console.log("about to shift messagesToTrack", messagesToTrack);
      messagesToTrack.shift();
      messagesToTrack.push("snz3:tool_arguments");
      return;
    }

    // HIDE
    // Message is a debug log or delimiter
    //
    // because it is not alphanumeric and had ansi codes
    //
    // NOTE: This must go below tool call responses.
    //
    // A debug log could be `***** Suggested tool call`
    // OR `***** Response from calling`
    // so we check tool responses above this statement
    // so we know when to send skips.
    if (
      (!parse.isFirstCharAlphanumeric(message) && hadAnsiCodes) ||
      parse.isDelimiter(message)
    ) {
      console.log("snz3 - found delimiter or debug log");
      return;
    }

    // -------------------------------------------------
    // Below we look at the last message tracked to see
    // if this new message is waiting for a tool call or
    // is a tool response.
    // -------------------------------------------------

    // Capture the message and return the top of the queue
    console.log("about to shift messagesToTrack", messagesToTrack);
    const lastMessage = messagesToTrack.shift();
    messagesToTrack.push(message);

    // HIDE
    // Last message indicated a tool response
    //
    // This message is the actual response to ignore
    if (lastMessage == "snz3:tool_response") {
      return;
    }

    // HIDE
    // Message asks for user input
    // Check if it is waiting for the user to confirm a tool call and if so send a skip
    // TODO: maybe use this to set a variable if the "to" is Client and then show the input field
    if (parse.startsWithProvideFeeback(message)) {
      if (lastMessage) {
        if (lastMessage == "snz3:tool_arguments") {
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
    if (!message.custom && !message.fromUser) {
      receivedAndDisplayedMessages.push(message.message);
    }
    setMessageList((prev) => [...prev, message]);
    if (!message.fromUser) {
      setLoading(false);
    }
  }

  function handleEnter(message: string) {
    console.log("snz3 - handle enter");
    setLoading(true);
    // const message = inputRef.current?.innerText || "";
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
    messagesToTrack.length = 0;
    receivedAndDisplayedMessages.length = 0;
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

  if (ready) {
    return (
      <ChatComponent
        inputRef={inputRef}
        loading={loading}
        messages={messageList}
        onSubmit={handleEnter}
        onRestart={restart}
        proceedToNextAgent={proceedToNextAgent}
        currentAgent={currentAgent}
        done={done}
        downloadURL={downloadURL}
      />
    );
  } else {
    return;
  }
}
