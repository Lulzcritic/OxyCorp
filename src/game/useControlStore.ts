import { create } from 'zustand';

type ControlState = {
  moving: boolean;
  setMoving: (value: boolean) => void;
};

export const useControlStore = create<ControlState>((set) => ({
  moving: false,
  setMoving: (value) => set({ moving: value }),
}));
