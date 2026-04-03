import { SupabaseStorageRepository } from "../supabase/SupabaseStorageRepository";
import { SupaBaseUserRepository } from "../supabase/SupaBaseUserRepository";
import type { StorageRepository } from "./StorageRepository";
import type { UserRepository } from "./UserRepository";

export const createUserRepository = () : UserRepository =>{
    return new SupaBaseUserRepository();
}

export const createStorageRepository = () : StorageRepository =>{
    return new SupabaseStorageRepository();
}


