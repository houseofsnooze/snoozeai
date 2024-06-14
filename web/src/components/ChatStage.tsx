import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AGENTS, STAGES } from "@/helpers/constants";
import Tooltip from "./Tooltip";

const stageKeys = Object.keys(STAGES);

const mutedClasses = "text-muted-foreground";
const defaultClasses = "text-foreground font-bold";

const DESCRIPTIONS = {
  [AGENTS["Client Rep"]]: "",
  [AGENTS["Spec Writer"]]:
    "Answer 5-7 questions about your contract. Click the arrow when you are ready to move to the next stage.",
  [AGENTS["Contract Writer"]]: "The agent spends 2-3 minutes writing Solidity.",
  [AGENTS["Contract Reviewer"]]:
    "The agent checks its work. If you want any changes made type them in the chat, otherwise click the arrow to move to the next stage.",
  [AGENTS["Test Writer"]]:
    "The agent spends 2-5 minutes writing tests in JavaScript.",
  [AGENTS["Test Reviewer"]]: "The agent checks its work.",
  [AGENTS["Test Fixer"]]:
    "In this last step the agent fixes any issues if the tests fail.",
};

export default function ChatStage({ agent }: { agent: string }) {
  function renderStages() {
    console.log("agent in chat stage", agent);
    return stageKeys.map((stageKey, index) => {
      return (
        <>
          {index > 0 && <BreadcrumbSeparator key={index * 2} />}
          <BreadcrumbItem key={index}>
            <Tooltip content={DESCRIPTIONS[stageKey]}>
              <BreadcrumbPage
                className={agent === stageKey ? defaultClasses : mutedClasses}
              >
                {STAGES[stageKey as keyof typeof STAGES]}
              </BreadcrumbPage>
            </Tooltip>
          </BreadcrumbItem>
        </>
      );
    });
  }
  return (
    <div className="container h-6">
      <Breadcrumb>
        <BreadcrumbList>{renderStages()}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
