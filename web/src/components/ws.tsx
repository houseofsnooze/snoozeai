"use client";

import { PartySocket } from "partysocket";
import { ErrorEvent } from "partysocket/ws";
import { useEffect, useMemo, useRef, useState } from "react";
import MessageContainer from "./MessageContainer";
import Message from "./Message";
import { Message as MT } from "../helpers/types";

import * as parse from "../helpers/parse";

const messageQueue: string[] = [];
const sentMessages: string[] = [];

export default function Ws() {
    const [messageList, setMessageList] = useState<MT[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentAgent, setCurrentAgent] = useState("");
    const [showNext, setShowNext] = useState(false);
    const [done, setDone] = useState(false);

    const ws = useRef<PartySocket | null>(null);

    useEffect(() => {
        if (!ws.current) {
            ws.current = new PartySocket({
                host: "127.0.0.1:8000",
                room: "snooz3-web",
            });
            ws.current.onopen = onOpen;
            ws.current.onmessage = onMessage;
            ws.current.onclose = onClose;
            ws.current.onerror = onError;
        }
        return () => {
            if (ws.current) {
              ws.current.close();
              ws.current = null;
            }
          }
    }, []);

    function onOpen() {
        console.log("connected");
        // send("let's start from the beginning. Ask me 'What smart contracts should we write today?' Do not precede this question with any other text");
    }

    function onMessage(e: MessageEvent) {
        if (!e.data) {
            return;
        }

        if (e.data.includes("Response from calling tool")) {
            // ignore
            messageQueue.shift();
            messageQueue.push("snz3:tool_response");
            return;
        }

        if (!parse.isFirstCharAlphanumeric(e.data)) {
            // ignore
            return;
        } else {
            const message = e.data.trim();

            if (message == sentMessages.pop()) {
                // this is the user's message
                return;
            }

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
                const { fromAgent, agent } = parse.checkAgentMessage(message);
                setCurrentAgent(agent);
                if (lastMessage) {
                    if (parse.startsWithArguments(lastMessage)) {
                        // skip and don't display
                        sendSkip();
                        return;
                    } else {
                        setShowNext(true);
                        return;
                    }
                } else {
                    // don't display
                    setShowNext(true);
                    return;
                }
            }

            displayMessage({ fromUser: false, message });
        }
    }

    function onClose(e: CloseEvent) {
        console.log('ws is closed with code: ' + e.code + ' reason: ' + e.reason);
        console.log("closed");
    }

    function onError(e: ErrorEvent) {
        console.log("error");
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
        setMessageList(prev => [...prev, message]);
        setLoading(false);
    }

    function handleEnter() {
        console.log("snz3 - handle enter");
        setShowNext(false);
        setLoading(true);
        setMessageList(prev => [...prev, { fromUser: true, message: inputValue }]);
        send(inputValue);
        setInputValue("");
    }

    function proceedToNextAgent() {
        setShowNext(false);
        setLoading(true);
        send("exit");
        if (currentAgent.includes("Test") && currentAgent.includes("Reviewer")) {
            setDone(true);
        }
    }

    function restart() {
        send("snooz3-restart");
    }

    function send(message: string) {
        ws.current?.send(message);
        sentMessages.push(message);
    }

    return (
        <div className="grid gap-4 max-w-5xl w-[100%]">
                {messageList.map((message, index) => (
                    <Message key={index} message={message.message} fromUser={message.fromUser} />
                ))}
            {done && (
                <div className="text-lg font-normal h-8 rounded-md px-3 text-xs text-center">
                    {"Done! Now you can catch some zzzs 😴"}
                </div>
            )}
            <div className="ml-auto min-w-[300px] w-1/3">
                <div className={"grid gap-4" + (done ? " hidden" : "")}>
                    <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input border-gray-700 bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 p-4" placeholder={messageList.length == 0 ? "what contracts do you want for your project?" : "enter a reply..."}></textarea>
                    <div className="flex items-center">
                        <div className="w-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors ml-auto">
                            <button onClick={restart} className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                            <svg style={{ color: "slategray" }} xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1.5"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                            </button>
                            
                                <button onClick={handleEnter} className="text-black flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-yellow-400/80 shadow-md shadow-yellow-600/50 text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                                    {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                    ): "send"}
                                </button>
                            
                            {showNext && (
                                <button onClick={proceedToNextAgent} className="ml-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                                    <svg style={{ color: "slategray" }}  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="1.5"  stroke-linecap="round"  stroke-linejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-player-track-next"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5v14l8 -7z" /><path d="M14 5v14l8 -7z" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
