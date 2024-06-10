import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { Message as MT } from "../helpers/types";

export default function ChatMessageContainer({ messageList }: { messageList: MT[] }) {
    const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const lastMessageRef = messageRefs.current[messageList.length - 1];
        if (lastMessageRef && lastMessageRef.parentElement) {
            const topPos = lastMessageRef.offsetTop;
            lastMessageRef.parentElement.scrollTop = topPos;
        }
        // const lastMessageRef = messageRefs.current[messageList.length - 1];
        // if (lastMessageRef) {
        //     lastMessageRef.scrollIntoView({ behavior: "smooth", block: "start" });
        // }
    }, [messageList]);

    return (
            messageList.map((message, index) => (
                <ChatMessage 
                    key={index} 
                    message={message.message} 
                    fromUser={message.fromUser} 
                    ref={el => { messageRefs.current[index] = el; }}
                />
            ))
    );
}
