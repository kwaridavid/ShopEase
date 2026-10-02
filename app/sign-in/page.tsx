import SignInButton from "@/components/layout/SignInButton";

export default function SignInPage({ searchParams }: { searchParams: { next?: string; error?: string } }) {
  const next = searchParams.next?.startsWith("/") && !searchParams.next.startsWith("//") ? searchParams.next : "/";
  return (
    <div className="mx-auto max-w-sm space-y-4 py-10 text-center">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="text-ink/70">Sign in to check out and view your orders.</p>
      {searchParams.error && <p className="err" role="alert">Sign-in didn't complete. Please try again.</p>}
      <SignInButton next={next} />
    </div>
  );
}
