import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-dark-100">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-white">404</h1>
        <p className="mt-4 text-xl text-light-200">Page not found</p>
        <p className="mt-2 text-light-200">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-primary-500 px-6 py-3 text-white transition-colors hover:bg-primary-600"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
