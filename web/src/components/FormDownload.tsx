import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface FormDownloadProps extends React.PropsWithChildren {}

export default function FormDownload({ children }: FormDownloadProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] flex justify-center items-center">
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLSc8KbHvdY3IpuG7adl9nlyO4yQINI6I4bxcpwuyDzVOlqmoMg/viewform?embedded=true"
          width="580"
          height="740"
        >
          Loading…
        </iframe>
      </DialogContent>
    </Dialog>
  );
}
