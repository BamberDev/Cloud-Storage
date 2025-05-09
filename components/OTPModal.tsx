"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";
import { CheckIcon } from "lucide-react";
import Loader from "./Loader";

export default function OTPModal({
  email,
  accountId,
}: {
  email: string;
  accountId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const sessionId = await verifySecret({ accountId, password });
      if (sessionId) router.push("/");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid token")) {
        setErrorMessage("Invalid OTP code. Please try again.");
      } else {
        setErrorMessage("Failed to verify OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setPassword(value);
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleResendOTP = async () => {
    if (resent) return;

    try {
      setResent(true);
      await sendEmailOTP({ email });
      setTimeout(() => setResent(false), 10000);
    } catch {
      setErrorMessage("Failed to resend OTP. Please try again.");
      setResent(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative">
          <AlertDialogTitle className="h2 text-center text-brand">
            Enter Your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="Close icon"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>
          <AlertDialogDescription className="subtitle-2 text-center">
            We&apos;ve sent a one-time password to
            <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP maxLength={6} value={password} onChange={handleOTPChange}>
          <InputOTPGroup className="shad-otp">
            <InputOTPSlot index={0} className="shad-otp-slot" />
            <InputOTPSlot index={1} className="shad-otp-slot" />
            <InputOTPSlot index={2} className="shad-otp-slot" />
            <InputOTPSlot index={3} className="shad-otp-slot" />
            <InputOTPSlot index={4} className="shad-otp-slot" />
            <InputOTPSlot index={5} className="shad-otp-slot" />
          </InputOTPGroup>
        </InputOTP>

        <AlertDialogFooter>
          <div className="flex flex-col w-full gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="primary-btn h-[52px]"
              disabled={isLoading}
              type="button"
              aria-label="Submit OTP"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Submiting...
                </>
              ) : (
                "Submit"
              )}
            </AlertDialogAction>
            <div className="subtitle-2 mt-2 text-center">
              {errorMessage && (
                <p className="error-message mb-2" role="alert">
                  {errorMessage}
                </p>
              )}
              <span>Didn&apos;t receive the code?</span>
              <Button
                type="button"
                variant="link"
                className="px-1 underline-offset-1 underline font-bold text-brand"
                disabled={resent}
                onClick={handleResendOTP}
                aria-label="Resend OTP code"
              >
                Resend{resent && <CheckIcon size={16} />}
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
