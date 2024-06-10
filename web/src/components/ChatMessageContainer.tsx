import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { Message as MT } from "../helpers/types";

export default function ChatMessageContainer({ messageList }: { messageList: MT[] }) {
    const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const lastMessageRef = messageRefs.current[messageList.length - 1];
        if (lastMessageRef && lastMessageRef.parentElement) {
            const topPos = lastMessageRef.offsetTop;
            lastMessageRef.parentElement.scrollTop = topPos;
        }
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
