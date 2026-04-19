import type { User } from "@supabase/supabase-js"
import type { Profile,AppRole } from "./Profile"


export interface SessionUser{
    user: User
    profile: Profile | null
    role?: AppRole;
}