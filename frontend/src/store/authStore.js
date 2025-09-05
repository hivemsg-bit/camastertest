import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  student: null,
  admin: null,
  adminToken: null,
  setStudent: (student) => set({ student }),
  setAdmin: (admin, adminToken) => set({ admin, adminToken }),
  logoutStudent: () => set({ student: null }),
  logoutAdmin: () => set({ admin: null, adminToken: null }),
}));

