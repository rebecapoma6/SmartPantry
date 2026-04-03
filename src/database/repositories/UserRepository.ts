import type { RegisterData } from "@/interfaces/Profile";
import type { SessionUser } from "@/interfaces/SessionUser";


export interface UserRepository {
    createUser(data: RegisterData): Promise<{ data?: SessionUser, error?: any }>;
}