import { create } from 'zustand';

type Store = {
  id?: string;
  open: boolean;
  setOpen: (open: boolean, id?: string) => void;
};

export const useEditBillStore = create<Store>()((set) => ({
  id: undefined,
  open: false,
  setOpen: (open: boolean, id?: string) => set((state) => ({ open: open, id: id })),
}));
