import { create } from 'zustand';

type ControlState = {
  // Animation / état
  moving: boolean;
  disableMovement: boolean;
  setMoving: (value: boolean) => void;

  // Axes de déplacement (caméra-relatifs)
  forward: number; // -1..1 (avant +1)
  right: number;   // -1..1 (droite +1)
  setAxes: (axes: { forward: number; right: number }) => void;

  // Sprint / run
  run: boolean;
  setRun: (value: boolean) => void;
};

export const useControlStore = create<ControlState>((set) => ({
  moving: false,
  disableMovement: false,
  setMoving: (value) => set({ moving: value }),

  forward: 0,
  right: 0,
  setAxes: ({ forward, right }) => set({ forward, right }),

  run: false,
  setRun: (value) => set({ run: value }),
}));
