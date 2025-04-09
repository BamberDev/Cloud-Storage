import AuthForm from "@/components/AuthForm";

export function generateMetadata() {
  return {
    title: "Sign In | Cloud Storage",
    description:
      "Sign in to your Cloud Storage account to access and manage your files.",
  };
}

export default function SignIn() {
  return <AuthForm type="sign-in" />;
}
