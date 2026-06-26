import { create } from 'zustand';

interface ProfileCompletionState {
  isModalOpen: boolean;
  activeStep: number;
  openCompletionModal: (step?: number) => void;
  closeCompletionModal: () => void;
  setActiveStep: (step: number) => void;
}

export const useProfileCompletionStore = create<ProfileCompletionState>((set) => ({
  isModalOpen: false,
  activeStep: 1,
  openCompletionModal: (step = 1) => set({ isModalOpen: true, activeStep: step }),
  closeCompletionModal: () => set({ isModalOpen: false }),
  setActiveStep: (step) => set({ activeStep: step }),
}));
