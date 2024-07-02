export const SNOOZE_AGENT_URL_KEY = "snooze-agent-url";
export const SNOOZE_AGENT_ID_KEY = "snooze-agent-id";
export const SNOOZE_RELAY_URL_KEY = "snooze-relay-url";
export const CENTRAL_RELAY_URL = "relay.snoozeai.xyz";
export const DUMMY_API_KEY = "dummy-snooze-api-key";

export const AGENTS = {
  Client: "Client",
  "Client Rep": "Client Rep",
  "Spec Writer": "Spec Writer",
  "Contract Writer": "Contract Writer",
  "Contract Reviewer": "Contract Reviewer",
  "Test Writer": "Test Writer",
  "Test Fixer": "Test Fixer",
  "Test Reviewer": "Test Reviewer",
};

export const STAGES = {
  [AGENTS["Spec Writer"]]: "Writing Specification",
  [AGENTS["Contract Writer"]]: "Writing Contract",
  [AGENTS["Contract Reviewer"]]: "Reviewing Contract",
  [AGENTS["Test Writer"]]: "Writing Tests",
  [AGENTS["Test Fixer"]]: "Reviewing Tests",
  [AGENTS["Test Reviewer"]]: "Final Review",
};
