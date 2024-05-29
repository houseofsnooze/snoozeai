"use client";

import { PartySocket } from "partysocket";
import { ErrorEvent } from "partysocket/ws";
import { useEffect, useMemo, useRef, useState } from "react";
import MessageContainer from "./MessageContainer";
import Message from "./Message";
import { Message as MT } from "../helpers/types";

let showNext = false;
let skipFeedback = false;
let storeNextMessage = false;

import * as parse from "../helpers/parse";

const AGENTS: Record<string, string> = {
    "Spec_Writer": "done with spec",
    "Contract_Writer": "done with contract",
    "Contract_Reviewer": "done with review",
    "Test_Writer": "done writing tests",
    "Test_Reviewer": "done reviewing tests",
    "Spec Writer": "done with spec",
    "Contract Writer": "done with contract",
    "Contract Reviewer": "done with review",
    "Test Writer": "done writing tests",
    "Test Reviewer": "done reviewing tests",
}

const messageQueue: string[] = [];

export default function Ws() {
    const [messageList, setMessageList] = useState<MT[]>([]);
    const [message, setMessage] = useState("");
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
        ws.current?.send("let's start from the beginning. Ask me 'What smart contracts should we write today?'");
    }

    function onMessage(e: MessageEvent) {
        console.log(messageQueue);
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

            const lastMessageInList: MT | undefined = messageList[messageList.length - 1];
            if (message == lastMessageInList?.message) {
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
        ws.current?.send("");
        skipFeedback = false;
    }

    function displayMessage(message: MT) {
        if (message.message == messageList[messageList.length - 1].message) {
            return;
        }
        setMessageList(prev => [...prev, message]);
        setLoading(false);
    }

    function handleEnter() {
        console.log("snz3 - handle enter");
        setShowNext(false);
        setLoading(true);
        setMessageList(prev => [...prev, { fromUser: true, message }]);
        ws.current?.send(message);
        setMessage("");
    }

    function proceedToNextAgent() {
        setShowNext(false);
        setLoading(true);
        ws.current?.send("exit");
        if (currentAgent.includes("Test") && currentAgent.includes("Reviewer")) {
            setDone(true);
        }
    }

    function restart() {
        ws.current?.send("snooz3-restart");
    }

    return (
        <div className="grid gap-4">
            <MessageContainer>
                {messageList.map((message, index) => (
                    <Message key={index} message={message.message} fromUser={message.fromUser} />
                ))}
            </MessageContainer>
            {done && (
                <div className="text-lg font-normal h-8 rounded-md px-3 text-xs text-center">
                    {"Done! Now you can catch some zzzs 😴"}
                </div>
            )}
            <div className="ml-auto min-w-[300px] w-1/3">
                <div className={"grid gap-4" + (done ? " hidden" : "")}>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 p-4" placeholder="Enter a reply..."></textarea>
                    <div className="flex items-center">
                        <div className="w-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors ml-auto">
                            <button onClick={restart} className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                                Restart
                            </button>
                            {showNext && currentAgent && (
                                <button onClick={proceedToNextAgent} className="flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-800/50 shadow-md shadow-yellow-600/50 text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                                    {AGENTS[currentAgent]}
                                </button>
                            )}
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>

                            ) : (
                                <button onClick={handleEnter} className="ml-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                                    Enter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
