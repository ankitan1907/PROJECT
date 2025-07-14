// src/types.ts

export interface PlanetFacts {
  atmosphere: string;
  temperature: string;
  moons: string;
  composition: string;
  orbit: string;
  interesting: string;
}

export interface PlanetData {
  name: string;
  color: string;
  distance: number;
  size: number;
  rotationSpeed: number;
  orbitalSpeed: number;
  texture: string;  // <-- Added texture property
  facts: PlanetFacts;
}


export type FactType = keyof PlanetFacts;