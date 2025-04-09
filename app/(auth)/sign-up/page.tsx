import AuthForm from "@/components/AuthForm";

export function generateMetadata() {
  return {
    title: "Sign Up | Cloud Storage",
    description:
      "Create an account to start using Cloud Storage and manage your files.",
  };
}

export default function SignUp() {
  return <AuthForm type="sign-up" />;
}
