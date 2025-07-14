// src/types.ts

export interface PlanetFacts {
  atmosphere: string;
  temperature: string;
  moons: string;
  composition: string;
  orbit: string;
  interesting: string;
}

// In your types.ts or wherever PlanetData is defined:
export interface PlanetData {
  name: string;
  color: string;
  distance: number;
  size: number;
  rotationSpeed: number;
  orbitalSpeed: number;
  texture: string;
  ringTexture?: string;  // Add this optional property for ring image path
  facts?: { [key: string]: string };
}



export type FactType = keyof PlanetFacts;