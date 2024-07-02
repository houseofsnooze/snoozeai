export default function InputExpandable({
  inputRef,
  disabled = false,
}: {
  inputRef: React.RefObject<HTMLSpanElement>;
  disabled?: boolean;
}) {
  return (
    <span
      ref={inputRef}
      className="min-h-10 w-full inline-block rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      contentEditable={!disabled}
    ></span>
  );
}
