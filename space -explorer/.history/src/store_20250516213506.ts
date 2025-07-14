import { create } from 'zustand';

interface StoreState {
  selectedPlanet: string | null;
  setSelectedPlanet: (planet: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
}));