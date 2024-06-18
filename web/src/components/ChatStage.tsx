import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  [AGENTS["Spec Writer"]]:
    "Answer 5-7 questions about your contract. If you are satisfied with the spec click the ⏩ arrows on the right to move to the next stage.",
  [AGENTS["Contract Writer"]]: "The agent spends 2-3 minutes writing Solidity.",
  [AGENTS["Contract Reviewer"]]: "The agent checks its work.",
  [AGENTS["Test Writer"]]:
    "The agent spends 2-5 minutes writing tests in JavaScript.",
  [AGENTS["Test Fixer"]]:
    "The agent fixes any issues found in the contracts and tests.",
  [AGENTS["Test Reviewer"]]:
    "In this final stage the agent checks its work and makes your files available for download.",
};

export default function ChatStage({
  incomingAgent,
}: {
  incomingAgent: string;
}) {
  const [agent, setAgent] = useState("Spec Writer");

  useEffect(() => {
    if (!incomingAgent.includes("Client")) {
      setAgent(incomingAgent);
    }
  }, [incomingAgent]);

  function renderStages() {
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

  function renderDescription() {
    return (
      <Alert>
        <AlertDescription>{DESCRIPTIONS[agent]}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>{renderStages()}</BreadcrumbList>
      </Breadcrumb>
      {renderDescription()}
    </div>
  );
}
