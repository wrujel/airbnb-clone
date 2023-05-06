import { create } from "zustand";

interface SearchModalState {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useSearchModal = create<SearchModalState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useSearchModal;
