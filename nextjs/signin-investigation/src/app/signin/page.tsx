import type { Metadata } from "next";
import { SignInForm } from "@/components/signin-form";

export const metadata: Metadata = {
  title: "ログイン",
  description: "モックの Cognito にログインします。",
};

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <header className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-brass">Sign in</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">ログイン</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite">
          モックの Cognito に対してログインします。発行されるトークンは署名のない偽物です。
        </p>
      </header>

      <SignInForm />
    </div>
  );
}
