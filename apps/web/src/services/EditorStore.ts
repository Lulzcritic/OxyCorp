import { create } from 'zustand';

interface EditorState {
  isEditorMode: boolean;
  playerCoords: [number, number, number];
  toggleEditorMode: () => void;
  setPlayerCoords: (coords: [number, number, number]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isEditorMode: false,
  playerCoords: [0, 0, 0],
  toggleEditorMode: () => set((state) => ({ 
    isEditorMode: !state.isEditorMode,
  })),
  setPlayerCoords: (coords) => set({ playerCoords: coords }),
}));
