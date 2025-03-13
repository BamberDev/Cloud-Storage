export const authFormConfig = (type: FormType, isLoading: boolean) => {
  const formTitle =
    type === "sign-in"
      ? "Sign In"
      : type === "sign-up"
      ? "Sign Up"
      : "Test Account";

  const buttonText = isLoading
    ? `Signing ${
        type === "sign-in" || type === "test-account" ? "In" : "Up"
      }...`
    : type === "sign-in" || type === "test-account"
    ? "Sign In"
    : "Sign Up";

  const linkInfo =
    type === "sign-in"
      ? {
          text: "Don't have an account?",
          buttonText: "Sign Up",
          href: "/sign-up",
        }
      : type === "sign-up"
      ? {
          text: "Already have an account?",
          buttonText: "Sign In",
          href: "/sign-in",
        }
      : {
          text: "Want to use OTP login?",
          buttonText: "Sign In with OTP",
          href: "/sign-in",
        };

  return { formTitle, buttonText, linkInfo };
};
