import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { STAGES } from "@/helpers/constants";

const stageKeys = Object.keys(STAGES);

const mutedClasses = "text-muted-foreground";
const defaultClasses = "text-foreground font-bold";

export default function ChatStage({ agent }: { agent: string }) {
  function renderStages() {
    return stageKeys.map((stageKey, index) => {
      return (
        <>
          {index > 0 && <BreadcrumbSeparator key={index * 2} />}
          <BreadcrumbItem key={index}>
            <BreadcrumbPage
              className={agent === stageKey ? defaultClasses : mutedClasses}
            >
              {STAGES[stageKey as keyof typeof STAGES]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    });
  }
  return (
    <div className="container h-10">
      <Breadcrumb>
        <BreadcrumbList>{renderStages()}</BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
