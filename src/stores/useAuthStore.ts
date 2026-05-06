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
  
  updateUserAvatar: (newUrl: string) => void
  updateUserName: (newName: string) => void

  // 🔥 1. Bien puestos en la interfaz
  ticketAlertas: number;          
  refrescarAlertas: () => void;
}

const userRepository = createUserRepository();

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    sessionUser: null,
    isAuthenticated: false,
    isAdmin: false,

    ticketAlertas: 0,

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

    refrescarAlertas: () => set((state) => ({ 
      ticketAlertas: state.ticketAlertas + 1 
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