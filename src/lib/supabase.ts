export * from "./supabase/client";
// Note: We don't export server/middleware here because they are environment-dependent.
// Use import { createClient } from "@/lib/supabase/server" explicitly in server components.
