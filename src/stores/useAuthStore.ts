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
  
  // 🔥 1. Agregamos las firmas de las nuevas funciones a la interfaz
  updateUserAvatar: (newUrl: string) => void
  updateUserName: (newName: string) => void
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
        isAdmin = role === 'AdminGeneral' || role === 'AdminUser';
      }

      set({
        sessionUser, 
        isAuthenticated: true,
        isAdmin
      });
    },

    clearSession: () => set({ sessionUser: null, isAuthenticated: false ,isAdmin: false }),

    // 🔥 2. Damos vida a las funciones: clonan el usuario actual y solo pisan el dato específico
    updateUserAvatar: (newUrl) => set((state) => ({
      sessionUser: state.sessionUser 
        ? { 
            ...state.sessionUser, 
            profile: { ...(state.sessionUser.profile as any), avatar_url: newUrl } 
          } 
        : null
    })),

    updateUserName: (newName) => set((state) => ({
      sessionUser: state.sessionUser 
        ? { 
            ...state.sessionUser, 
            profile: { ...(state.sessionUser.profile as any), nombre: newName } 
          } 
        : null
    })),

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