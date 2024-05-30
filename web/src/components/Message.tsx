import MarkdownPreview from '@uiw/react-markdown-preview';

interface MessageProps {
    name?: string;
    message?: string;
    fromUser: boolean;
}

const wrapperClasses = "flex flex-col items-start gap-2 rounded-lg p-1 mb-4 text-left text-sm transition-all hover:bg-accent"

export default function Message({ name, message, fromUser }: MessageProps) {
    return (
        <div
            className={fromUser ? wrapperClasses + " ml-auto bg-blue-800/50 shadow-md shadow-yellow-600/50" : wrapperClasses}
        >
            <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold">{name}</div>
                        {/* <span className="flex h-2 w-2 rounded-full bg-blue-600"></span> */}
                    </div>
                    {/* <div className="ml-auto text-xs text-muted-foreground">about 1 year ago</div> */}
                </div>
                {/* <div className="text-xs font-medium">Important Announcement</div> */}
            </div>
                {fromUser ? (
            <div className="text-xs">
                    <div className="text-sm text-muted-foreground pb-2 px-2">
                        {message}
                    </div>
                    </div>
                ) : (
            <div className="text-xs text-muted-foreground">
                    <div className="text-xs text-muted-foreground">
                        <MarkdownPreview source={message} style={{ paddingBottom: 10, paddingTop: 0, paddingLeft: 8, paddingRight: 8, maxWidth: '80vw', borderRadius: "6px", background: "transparent" }} />
                    </div>
            </div>
                )}
            {/* <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">meeting</div>
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">work</div>
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">important</div>
            </div> */}
        </div>

    );
}
