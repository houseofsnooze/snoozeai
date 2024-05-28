interface MessageProps {
    name?: string;
    message?: string;
}

export default function Message({ name, message }: MessageProps) {
    return (
        <button
            className="flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent"
        >
            <div className="flex w-full flex-col gap-1">
                <div className="flex items-center">
                    <div className="flex items-center gap-2">
                        <div className="font-semibold">{name}</div>
                        <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                    </div>
                    {/* <div className="ml-auto text-xs text-muted-foreground">about 1 year ago</div> */}
                </div>
                {/* <div className="text-xs font-medium">Important Announcement</div> */}
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
                {message}
            </div>
            {/* <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">meeting</div>
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80">work</div>
                <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">important</div>
            </div> */}
        </button>

    );
}
