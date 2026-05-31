import { create } from "zustand";
import { persist } from "zustand/middleware";


type Theme = "light" | "dark" | "system";

interface UIState {
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Global Modal State
  modalIsOpen: boolean;
  modalContent: React.ReactNode | null;
  modalTitle: string;
  openModal: (title: string, content: React.ReactNode) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),

      modalIsOpen: false,
      modalContent: null,
      modalTitle: "",
      openModal: (title, content) =>
        set({ modalIsOpen: true, modalTitle: title, modalContent: content }),
      closeModal: () =>
        set({ modalIsOpen: false, modalContent: null, modalTitle: "" }),
    }),
    {
      name: "mdcs_ui_store",
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    },
  ),
);
