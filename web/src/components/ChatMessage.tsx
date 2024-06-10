import MarkdownPreview from '@uiw/react-markdown-preview';
import React, { PropsWithRef } from 'react';

interface ChatMessageProps {
    message?: string;
    fromUser: boolean;
}

const wrapperClasses = "flex flex-col items-start gap-2 rounded-lg p-1 mb-4 text-sm transition-all max-w-xl hover:bg-secondary/80";
const fromUserWrapperClasses = "flex flex-col items-start gap-2 rounded-lg p-1 mb-4 text-sm transition-all max-w-xl ml-auto bg-yellow hover:bg-primary/80";

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(({ message, fromUser }, ref) => {
    return (
        <div ref={ref} className={fromUser ? fromUserWrapperClasses : wrapperClasses}>
            <div></div>
            {fromUser ? (
                <div className="font-bold pb-2 px-2">
                    <MarkdownPreview
                        source={message}
                        style={{
                            background: "transparent",
                            color: "black"
                        }} />
                </div>
            ) : (
                <MarkdownPreview
                    source={message}
                    style={{
                        paddingBottom: 10,
                        paddingTop: 0,
                        paddingLeft: 8,
                        paddingRight: 8,
                        maxWidth: '80vw',
                        borderRadius: "6px",
                        background: "transparent"
                    }} />
            )}
        </div>
    );
});
