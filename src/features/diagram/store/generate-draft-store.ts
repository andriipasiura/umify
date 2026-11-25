import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const GENERATE_DRAFT_STORAGE_KEY = 'umify:generate-draft';

type GenerateDraftState = { description: string };
type GenerateDraftActions = {
  setDescription: (description: string) => void;
  clear: () => void;
};

export const useGenerateDraftStore = create<GenerateDraftState & GenerateDraftActions>()(
  persist(
    (set) => ({
      description: '',
      setDescription: (description) => set({ description }),
      clear: () => set({ description: '' }),
    }),
    {
      name: GENERATE_DRAFT_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ description }) => ({ description }),
    },
  ),
);
