import LoadingSpinner from "./LoadingSpinner";
import { Button } from "./ui/button";

export default function ButtonSend({ onClick, loading, color }: { onClick: () => void, loading: boolean, color: "yellow" | "accent" }) {
    return (
        <Button
            onClick={onClick}
            className={`flex-1 text-xl font-bold shadow bg-${color} hover:bg-yellow/90 mx-2`}
            disabled={loading}
        >
            {loading ? <LoadingSpinner /> : "SEND"}
        </Button>
    )
}
