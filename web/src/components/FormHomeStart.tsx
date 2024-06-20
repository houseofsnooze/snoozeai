"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "./LoadingSpinner";
import { DUMMY_API_KEY } from "@/helpers/constants";

interface FormHomeStartProps {
  onEnter: ({
    emailAddress,
    telegramHandle,
    accessCode,
  }: {
    emailAddress: string;
    telegramHandle: string;
    accessCode: string;
  }) => void;
  cancel: () => void;
  loading: boolean;
}

export default function FormHomeStart({
  onEnter,
  cancel,
  loading,
}: FormHomeStartProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const telegramRef = useRef<HTMLInputElement>(null);
  const accessCodeRef = useRef<HTMLInputElement>(null);

  function handleClick() {
    if (emailRef.current && telegramRef.current && accessCodeRef.current) {
      const emailAddress = emailRef.current.value.trim();
      const telegramHandle = telegramRef.current.value.trim();
      const accessCode = accessCodeRef.current.value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailAddress || emailAddress == "") {
        console.log("email is empty");
        return;
      } else if (!emailRegex.test(emailAddress)) {
        console.log("email is not in a valid format");
        return;
      }

      if (!accessCode || accessCode == "") {
        console.log("access code is empty");
        return;
      }

      onEnter({
        emailAddress,
        telegramHandle,
        accessCode,
      });
    }
    return;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          email
        </label>
        <Input
          className="text-xl"
          ref={emailRef}
          placeholder="email@example.com"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          telegram handle
        </label>
        <Input
          className="text-xl"
          ref={telegramRef}
          placeholder="telegram_handle"
        />
      </div>
      <div>
        <label className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          invite code
        </label>
        <Input
          className="text-xl"
          ref={accessCodeRef}
          placeholder="zzz-zzz-zzz-zzz-zzz"
          defaultValue={DUMMY_API_KEY}
        />
      </div>
      <div className="flex gap-2">
        {!loading && (
          <Button
            onClick={cancel}
            className="w-fit text-2xl font-bold shadow uppercase"
            variant={"outline"}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleClick}
          className="w-fit text-2xl font-bold shadow uppercase"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Enter"}
        </Button>
      </div>
    </div>
  );
}
