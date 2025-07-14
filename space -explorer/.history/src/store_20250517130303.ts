import create from 'zustand';
import * as THREE from 'three';

interface StoreState {
  selectedPlanet: string | null;
  planetPosition: THREE.Vector3 | null;
  setSelectedPlanet: (name: string | null) => void;
  setPlanetPosition: (pos: THREE.Vector3 | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedPlanet: null,
  planetPosition: null,
  setSelectedPlanet: (name) => set({ selectedPlanet: name }),
  setPlanetPosition: (pos) => set({ planetPosition: pos }),
}));
