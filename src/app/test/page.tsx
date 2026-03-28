import { createClient } from "@/lib/supabase/server";
import RealtimeTester from "@/components/RealtimeTester";

export const dynamic = "force-dynamic";

export default async function TestPage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("name, description");

  if (error) {
    return (
      <div className="p-10 font-mono text-red-500">
        Error fetching profiles: {error.message}
      </div>
    );
  }

  return (
    <div className="p-10 bg-black text-white min-h-screen font-sans">
      <h1 className="text-2xl font-bold mb-8 border-b border-white/20 pb-4">
        Supabase Connection Test
      </h1>
      
      {!profiles || profiles.length === 0 ? (
        <p className="text-gray-400">No profiles found. (Did you run the SQL insert?)</p>
      ) : (
        <ul className="space-y-6">
          {profiles.map((profile, i) => (
            <li key={i} className="border-l border-white/20 pl-4">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-gray-400 mt-1">{profile.description}</p>
            </li>
          ))}
        </ul>
      )}

      <RealtimeTester />

      <div className="mt-10 pt-4 border-t border-white/10 text-xs text-gray-500 uppercase tracking-widest">
        Verifying Connection: {profiles ? "SUCCESS" : "WAITING"}
      </div>
    </div>
  );
}
