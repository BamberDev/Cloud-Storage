"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  createAccount,
  signInUser,
  signInTestUser,
} from "@/lib/actions/user.actions";
import OTPModal from "./OTPModal";
import { useRouter } from "next/navigation";
import { TestAccountSelect } from "./TestAccountSelect";

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2).max(50)
        : z.string().optional(),
    password:
      formType === "test-account" ? z.string().min(6) : z.string().optional(),
  });
};

export default function AuthForm({ type }: { type: FormType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountId, setAccountId] = useState(null);
  const router = useRouter();

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (type === "test-account") {
        await signInTestUser({
          email: values.email,
          password: values.password || "",
        });
        router.push("/");
      } else {
        const user =
          type === "sign-up"
            ? await createAccount({
                fullName: values.fullName || "",
                email: values.email,
              })
            : await signInUser({ email: values.email });

        setAccountId(user.accountId);
      }
    } catch {
      setErrorMessage(
        `${
          type === "sign-in"
            ? "Failed to sign in."
            : type === "sign-up"
            ? "Failed to create account."
            : "Failed to sign in to test account."
        } Please try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAccountSelect = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === "sign-in"
              ? "Sign In"
              : type === "sign-up"
              ? "Sign Up"
              : "Test Account"}
          </h1>
          {type === "sign-up" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="sr-only">
                    Full Name input
                  </FormDescription>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          {type === "test-account" ? (
            <FormField
              control={form.control}
              name="email"
              render={() => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">
                      Test Account
                    </FormLabel>
                    <FormControl>
                      <TestAccountSelect onSelect={handleTestAccountSelect} />
                    </FormControl>
                  </div>
                  <FormDescription className="sr-only">
                    Select test account
                  </FormDescription>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email address"
                        className="shad-input"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormDescription className="sr-only">
                    Email input
                  </FormDescription>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {isLoading && (
              <Image
                src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="animate-spin"
              />
            )}
            {isLoading
              ? `Signing ${
                  type === "sign-in" || type === "test-account" ? "In" : "Up"
                }...`
              : type === "sign-in" || type === "test-account"
              ? "Sign In"
              : "Sign Up"}
          </Button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div>
            <div className="body-2 flex justify-center">
              <p className="text-light-100">
                {type === "sign-in"
                  ? "Don't have an account?"
                  : type === "sign-up"
                  ? "Already have an account?"
                  : "Want to use OTP login?"}
              </p>
              <Link
                href={
                  type === "sign-up" || type === "test-account"
                    ? "/sign-in"
                    : "/sign-up"
                }
                className="ml-1 font-medium underline"
              >
                {type === "sign-in"
                  ? "Sign Up"
                  : type === "sign-up"
                  ? "Sign In"
                  : "Sign In with OTP"}
              </Link>
            </div>
            {type !== "test-account" && (
              <div className="text-center body-2">
                <p className="my-3">OR</p>
                <Link href="/test-account" className="font-medium underline">
                  Try Test Account
                </Link>
              </div>
            )}
          </div>
        </form>
      </Form>
      {accountId && type !== "test-account" && (
        <OTPModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
}
