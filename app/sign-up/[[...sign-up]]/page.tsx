import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <p className="text-sm text-gray-600 mb-4">
        <Link href="/" className="text-brand-700 hover:underline">
          Dayli Energy
        </Link>
      </p>
      <SignUp
        signInUrl="/sign-in"
        appearance={{
          elements: {
            formButtonPrimary: "bg-brand-700 hover:bg-brand-900",
            footerActionLink: "text-brand-700",
          },
        }}
      />
    </div>
  );
}
