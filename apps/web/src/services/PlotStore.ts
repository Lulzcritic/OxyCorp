import { create } from 'zustand';

interface PlotState {
  /** Record of harvested nodes. Key is the node ID (e.g., plot seed + index). */
  harvestedNodes: Record<string, boolean>;
  /** Server remaining resources quantity */
  remainingQty: number | null;
  /** Server resources capacity */
  capacity: number | null;
  /** Mark a node as harvested */
  harvestNode: (nodeId: string) => void;
  /** Clear harvested nodes (useful when switching plots) */
  resetPlot: () => void;
  /** Sync server resources state */
  setResources: (remainingQty: number, capacity: number, harvestedList?: string[]) => void;
}

export const usePlotStore = create<PlotState>((set) => ({
  harvestedNodes: {},
  remainingQty: null,
  capacity: null,
  harvestNode: (nodeId) => set((state) => ({
    harvestedNodes: { ...state.harvestedNodes, [nodeId]: true }
  })),
  resetPlot: () => set({ harvestedNodes: {}, remainingQty: null, capacity: null }),
  setResources: (remainingQty, capacity, harvestedList = []) => set((state) => {
    const newHarvested = { ...state.harvestedNodes };
    harvestedList.forEach(id => {
      newHarvested[id] = true;
    });
    return { remainingQty, capacity, harvestedNodes: newHarvested };
  }),
}));
