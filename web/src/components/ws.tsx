"use client";

import { PartySocket } from "partysocket";
import { ErrorEvent } from "partysocket/ws";
import { useEffect, useMemo, useRef, useState } from "react";
import Message from "./Message";
import { Message as MT } from "../helpers/types";
import { Socket, io } from "socket.io-client";

import ButtonNext from "./ButtonNext";
import ButtonSend from "./ButtonSend";
import ButtonTrash from "./ButtonTrash";

import * as parse from "../helpers/parse";
import { SNOOZE_AGENT_URL_KEY, SNOOZE_RELAY_URL_KEY } from "../helpers/constants";
import Tooltip from "./Tooltip";

const messageQueue: string[] = [];
const sentMessages: string[] = [];
let currentAgent: string = "Spec Writer";
const seenAgents = new Set<string>();

interface WsProps {
    relayAddress: string;
    agentAddress: string;
}

export default function Ws({ relayAddress, agentAddress }: WsProps) {
    const [messageList, setMessageList] = useState<MT[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(false);
    // const [currentAgent, setCurrentAgent] = useState("Spec Writer");
    const [showStart, setShowStart] = useState(true);
    const [doneWithSpec, setDoneWithSpec] = useState(false);
    const [done, setDone] = useState(false);
    const [reset, setReset] = useState(false);

    const ws = useRef<Socket | null>(null);

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
        }
    }, []);

    function onOpen() {
        setLoading(false);
        console.log("connected");
        requestPair();
        if (reset) {
            console.log("was reset");
            send("let's start from the beginning. Ask me 'What smart contracts should we write today?' Do not precede this question with any other text");
            setReset(false);
        } else {
            ready && setShowStart(true);
        }
    }

    function requestPair() {
        send("snooz3-pair " + agentAddress);
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
            displayMessage({ fromUser: false, message: "Error pairing with agent. Please refresh the page and try again." });
            setError(true);
            return;
        }

        const { fromAgent, agent } = parse.checkAgentMessage(data);
        if (fromAgent) {
            console.log("prev agent", currentAgent, "next agent", agent);
            currentAgent = agent;
            seenAgents.add(agent);
            return;
        }

        if (data.includes("```javascript") &&
            data.includes("const { expect }")
        ) {
            const message = data.trim();
            displayMessage({ fromUser: false, message });
            return;
        }

        if (data.includes("```solidity") && data.includes("pragma solidity ^0.8.0;")) {
            const message = data.trim();
            displayMessage({ fromUser: false, message });
            return;
        }

        if (data.includes("Please give feedback to Client Rep. Press enter or type 'exit' to stop the conversation:") && (seenAgents.has("Test Fixer") || seenAgents.has("Test_Fixer"))) {
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
        console.log('ws is closed with code: ' + e.code + ' reason: ' + e.reason);
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
        setMessageList(prev => [...prev, message]);
        setLoading(false);
    }

    function handleEnter() {
        console.log("snz3 - handle enter");
        setLoading(true);
        setMessageList(prev => [...prev, { fromUser: true, message: inputValue }]);
        send(inputValue);
        setInputValue("");
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
        setInputValue("");
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
        return currentAgent.includes("Spec") || currentAgent.includes("Contract Reviewer") || currentAgent.includes("Contract_Reviewer") || currentAgent.includes("Fixer");
    }

    return (
        <div className="grid gap-4 max-w-5xl w-[100%] p-10">
            {messageList.map((message, index) => (
                <Message key={index} message={message.message} fromUser={message.fromUser} />
            ))}
            {done && (
                <h2 className="scroll-m-20 pb-2 text-3xl tracking-tight first:mt-0 text-gray-400">
                    {"Done! Now you can catch some zzzs 😴"}
                </h2>
            )}
            <div className="ml-auto min-w-[300px] w-1/3">
                <div className={"grid gap-4" + ((done) ? " hidden" : "")}>
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input border-gray-700 bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 p-4" placeholder={messageList.length == 0 ? "What contracts do you want for your project?" : "Enter a reply..."}></textarea>
                    <div className="flex items-center">
                        <div className="w-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors ml-auto">
                            <Tooltip content="Restart"><ButtonTrash onClick={restart} /></Tooltip>
                            {agentAvailable() ? (
                                <>
                                    <ButtonSend color={doneWithSpec ? "accent" : "yellow"} onClick={handleEnter} loading={loading} />
                                    {doneWithSpec && (
                                        <button
                                            onClick={proceedToNextAgent}
                                            className="text-black ml-4 font-bold flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-yellow-600/50 text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs"
                                            style={{ backgroundColor: "rgb(213, 234, 23)" }}
                                        >
                                            {loading ? (
                                                <svg className="w-full animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            ) : "Done with spec"}
                                        </button>
                                    )}
                                    <Tooltip content="Skip to next stage"><ButtonNext onClick={proceedToNextAgent} /></Tooltip>
                                </>
                            ) : (
                                <button
                                    disabled
                                    className="text-black font-bold flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-md shadow-yellow-600/50 text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs"
                                    style={{ backgroundColor: "rgb(213, 234, 23)" }}
                                >Snooze works hard so you can sleep 😴</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
