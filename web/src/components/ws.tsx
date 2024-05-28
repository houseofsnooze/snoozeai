"use client";

import { PartySocket } from "partysocket";
import { ErrorEvent } from "partysocket/ws";
import { useEffect, useMemo, useState } from "react";
import MessageContainer from "./MessageContainer";
import Message from "./Message";

let storeNextMessage = false;
let suggestedTools: string[] = [];

const AGENTS = {
    "Spec Writer": "done with spec",
    "Contract Writer": "done with contract",
    "Contract Reviewer": "done with review",
}

export default function Ws() {
    const [messageList, setMessageList] = useState<string[]>([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [agent, setAgent] = useState("Spec Writer");

    const ws = useMemo(() => new PartySocket({
        host: "localhost:8080", // or localhost:1999 in dev
        room: "snooz3-web",
      }), []);

    ws.onopen = onOpen;
    ws.onmessage = onMessage;
    ws.onclose = onClose;
    ws.onerror = onError;

    function getAgentName(message: string): string | undefined {
        const regex = /Provide feedback to ([^.]+)\./;
        const match = message.match(regex);
        if (match) {
            const result = match[1];
            return result;
        }
    }
  
    function onOpen() {
      console.log("connected");
    }

    function onMessage(e: MessageEvent) {
      console.log("message", e.data);

      if (storeNextMessage) {
        setMessageList(prev => [...prev, e.data]);
        setLoading(false);
      }
      // reset it
      storeNextMessage = false;

      if (e.data.startsWith("Provide feedback") && suggestedTools.length > 0) {
        ws.send("");
        suggestedTools = [];
      } else if (e.data.startsWith("Provide feedback")) {
        const agentName = getAgentName(e.data);
        if (agentName && agentName in AGENTS) {
            setAgent(agentName);
        }
        setShowNext(true);
      } else if (e.data.includes("Suggested tool call (call_")) {
        suggestedTools.push(e.data);
      } else if (e.data.includes("to Client")) {
        storeNextMessage = true;
      }

    }

    function onClose(e: CloseEvent) {
        console.log('ws is closed with code: ' + e.code + ' reason: ' + e.reason);
      console.log("closed");
    }

    function onError(e: ErrorEvent) {
      console.log("error");
    }

  function sendMessage() {
    setShowNext(false);
    setLoading(true);
    ws.send(message);
    setMessage("");
  }

  function proceedToNextAgent() {
    setShowNext(false);
    setLoading(true);
    ws.send("exit");
  }

  return (
    <div className="grid gap-4">
        <MessageContainer>
            {messageList.map((message, index) => (
                <Message key={index} message={message} />
            ))}
        </MessageContainer>
    <div className="ml-auto min-w-[300px] w-1/3">
        <div className="text-xs font-normal h-8 rounded-md px-3 text-xs ml-auto">
            Code less. Build more.
        </div>
            <div className="grid gap-4">
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 p-4" placeholder="Enter a reply..."></textarea>
                <div className="flex items-center">
                    <div className="w-full inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors ml-auto">
                        {showNext && (
                            <button onClick={proceedToNextAgent} className="border flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                                {AGENTS[agent as keyof typeof AGENTS]}
                            </button>
                        )}

                    {loading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>

                    ) : (
                    <button onClick={sendMessage} className="ml-auto focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-8 rounded-md px-3 text-xs">
                        snooz3
                    </button>
                )}
                    </div>
                </div>
            </div>
    </div>
    </div>
  );
}
