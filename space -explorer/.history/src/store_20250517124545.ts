import { create } from 'zustand';

interface StoreState {
  setPlanetPosition: any;
  selectedPlanet: string | null;
  setSelectedPlanet: (planet: string | null) => void;
}
planetPosition: new THREE.Vector3(),
setPlanetPosition: (position: THREE.Vector3) => set({ planetPosition: position }),

export const useStore = create<StoreState>((set) => ({
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
}));