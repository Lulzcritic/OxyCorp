import { create } from 'zustand';

interface PlotState {
  /** Record of harvested nodes. Key is the node ID (e.g., plot seed + index). */
  harvestedNodes: Record<string, boolean>;
  /** Mark a node as harvested */
  harvestNode: (nodeId: string) => void;
  /** Clear harvested nodes (useful when switching plots) */
  resetPlot: () => void;
}

export const usePlotStore = create<PlotState>((set) => ({
  harvestedNodes: {},
  harvestNode: (nodeId) => set((state) => ({
    harvestedNodes: { ...state.harvestedNodes, [nodeId]: true }
  })),
  resetPlot: () => set({ harvestedNodes: {} }),
}));
