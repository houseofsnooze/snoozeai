"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FormHomeConfigProps {
    onEnter: (relayAddress: string, agentAddress: string) => void;
}

export default function FormHomeConfig({ onEnter }: FormHomeConfigProps) {
    const relayAddress = useRef<HTMLInputElement>(null)
    const agentAddress = useRef<HTMLInputElement>(null)

    function handleClick() {
        if (relayAddress.current && agentAddress.current) {
            onEnter(relayAddress.current.value, agentAddress.current.value)
        }
        return;
    }

    return (
        <div className="w-1/3 space-y-4">
            <div>
            <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Relay address</label>
            <Input
                className="text-xl"
                ref={relayAddress}
                placeholder="ws://127.0.0.1:8000"
                defaultValue="ws://127.0.0.1:8000"
                />
            </div>
            <div>
            <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Agent address</label>
            <Input
                className="text-xl"
                ref={agentAddress}
                placeholder="ws://127.0.0.1:1337"
                defaultValue="ws://127.0.0.1:1337"
            />
            </div>
            <Button
                onClick={handleClick}
                className="w-fit text-2xl font-bold shadow"
            >ENTER</Button>
        </div>
    )
}
