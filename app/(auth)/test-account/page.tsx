import AuthForm from "@/components/AuthForm";

export function generateMetadata() {
  return {
    title: "Test Account | Cloud Storage",
    description:
      "Use our test account to explore the features of Cloud Storage without signing up.",
  };
}

export default function TestAccount() {
  return <AuthForm type="test-account" />;
}
