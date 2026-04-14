import { create } from "zustand"
import { persist } from 'zustand/middleware'
import type { SessionUser } from "../interfaces/SessionUser"
import { createUserRepository } from "@/database/repositories"



interface AuthState {
  sessionUser: SessionUser | null
  isAuthenticated: boolean
  isAdmin: boolean

  setSession: (sessionUser: SessionUser) => void
  clearSession: () => void
}

const userRepository = createUserRepository();


export const useAuthStore = create<AuthState>()(

  persist((set) => ({
    sessionUser: null,
    isAuthenticated: false,
    isAdmin: false,

    setSession: async (sessionUser) => {
      let isAdmin = false;
      
      if (sessionUser.profile?.id) {
        const { data: role } = await userRepository.obtenerRolUsuario(sessionUser.profile.id);
        isAdmin = role === 'admin';
      }

      set({
        sessionUser, 
        isAuthenticated: true,
        isAdmin
      });
    },

    clearSession: () => set({ sessionUser: null, isAuthenticated: false ,isAdmin: false }),

  }),
  {
    name: 'auth-v1', 
    version: 1,
    partialize: (state) => ({ 
      sessionUser: state.sessionUser,
      isAuthenticated: state.isAuthenticated,
      isAdmin: state.isAdmin,
    }),
  }
  )
)