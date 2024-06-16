import { AGENTS } from "./constants";

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

export function includesAvailableAgent(agents?: string[]) {
  if (agents) {
    if (agents.length > 0) {
      return agents.includes("Spec Writer") && agents.includes("Client");
    }
  }
  return true;
}

export function checkSpeakerMessage(msg: string): {
  fromAgent: boolean;
  sender: string;
  recipient: string;
} {
  console.log("snz3 - checkSpeakerMessage");
  const message = removeAnsiCodes(msg);
  const keys = Object.keys(AGENTS);

  let sender = "";
  let recipient = "";

  for (let key of keys) {
    const checkThis = key + " (to";
    if (message.includes(checkThis)) {
      sender = key;
      recipient = message.split(" (to ")[1].split("):")[0].trim();
      break;
    }
  }

  if (sender) {
    return { fromAgent: true, sender, recipient };
  } else {
    return { fromAgent: false, sender: "", recipient: "" };
  }
}

export function isFirstCharAlphanumeric(input: string) {
  return /^[a-zA-Z0-9#`]/.test(input);
}

export function removeAnsiCodes(input: string) {
  const ansiEscapeCodePattern = /\u001b\[[0-9;]*m/g;
  return input.replace(ansiEscapeCodePattern, "");
}
