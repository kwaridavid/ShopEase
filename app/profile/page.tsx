import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";

export const dynamic = "force-dynamic";

export default async function Profile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="flex items-center gap-4 rounded-lg border border-line bg-white p-5">
        {profile?.avatar_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full" referrerPolicy="no-referrer" />}
        <div><p className="font-semibold">{profile?.full_name ?? "Shopper"}</p><p className="text-sm text-ink/60">{profile?.email ?? user?.email}</p></div>
      </div>
      <form action={signOut}><button className="btn-ghost">Sign out</button></form>
    </div>
  );
}
