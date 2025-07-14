import { create } from 'zustand';
import * as THREE from 'three';

interface StoreState {
  selectedPlanet: string | null;
  setSelectedPlanet: (planet: string | null) => void;

  planetPosition: THREE.Vector3 | null;
  setPlanetPosition: (position: THREE.Vector3) => void;
}

export const useStore = create<StoreState>((set) => ({
  selectedPlanet: null,
  setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),

  planetPosition: null,
  setPlanetPosition: (position) => set({ planetPosition: position }),
}));
