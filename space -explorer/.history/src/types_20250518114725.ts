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
  distance?: number;  // made optional
  size: number;
  rotationSpeed: number;
  orbitalSpeed: number;
  texture: string;
  ringTexture?: string;
  initialAngle?: number;
  eccentricity?: number;
  inclination?: number;
  orbitRadiusX?: number;
  orbitRadiusY?: number;
// Make this optional number
  facts: {
    atmosphere: string;
    temperature: string;
    moons: string;
    composition: string;
    orbit: string;
    interesting: string;
  };
}



export type FactType = keyof PlanetFacts;