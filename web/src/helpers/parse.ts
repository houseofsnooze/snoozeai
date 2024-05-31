export function startsWithProvideFeeback(message: string) {
    if (message) {
        if (message.includes("Provide feedback to ")) {
            console.log("snz3 - found feedback");
            return true;
        }
    }
    return false;
}

export function startsWithArguments(message: string) {
    if (message) {
        if (message.startsWith("Arguments")) {
            console.log("snz3 - found arguments");
            return true;
        }
    }
    return false;
}

export function includesSuggestedToolCall(message: string) {
    if (message) {
        if (message.includes("tool call")) {
            console.log("snz3 - found tool call");
            return true;
        }
    }
    return false;
}

export function includesToClient(message: string) {
    if (message) {
        if (message.includes("to Client")) {
            console.log("snz3 - found to client");
            return true;
        }
    }
    return false;
}

const AGENTS = {
    "Spec_Writer": "done with spec",
    "Client_Rep": "proceed",
    "Client Rep": "proceed",
    "Contract_Writer": "done with contract",
    "Contract_Reviewer": "done with review",
    "Test_Writer": "done writing tests",
    "Test_Reviewer": "done reviewing tests",
    "Test_Fixer": "done fixing tests",
    "Spec Writer": "done with spec",
    "Contract Writer": "done with contract",
    "Contract Reviewer": "done with review",
    "Test Writer": "done writing tests",
    "Test Fixer": "done fixing tests",
    "Test Reviewer": "done reviewing tests",
}

export function checkAgentMessage(msg: string) {
    console.log("snz3 - checkAgentMessage");
        const message = removeAnsiCodes(msg);
        const AGENTS_KEYS = Object.keys(AGENTS);
        let agent;


        for (let key of AGENTS_KEYS) {
            const checkThis = key + " (to";
            if (message.includes(checkThis)) {
                agent = key;
                break;
            }
        }
        if (agent) {
            return { fromAgent: true, agent: agent };
        } else {
            return { fromAgent: false, agent: "" };
        }
    }

export function isFirstCharAlphanumeric(input: string) {
    return /^[a-zA-Z0-9#`]/.test(input);
}

export function removeAnsiCodes(input: string) {
    const ansiEscapeCodePattern = /\u001b\[[0-9;]*m/g;
    return input.replace(ansiEscapeCodePattern, '');
}
