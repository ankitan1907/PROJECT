import { PlanetData } from '../types';

// Planetary data with real astronomical values (scaled for visualization)
export const planetData: PlanetData[] = [
  {
    name: 'Mercury',
    color: '#A0522D',
    distance: 4,
    size: 0.4,
    // Mercury rotates once every 59 Earth days
    rotationSpeed: 0.017,
    // Mercury orbits the Sun every 88 Earth days
    orbitalSpeed: 0.047,
    facts: {
      atmosphere: "Mercury has a very thin atmosphere, called an exosphere, composed mostly of oxygen, sodium, hydrogen, helium, and potassium.",
      temperature: "Temperature ranges from -180°C at night to 430°C during the day, the most extreme in the solar system.",
      moons: "Mercury has no moons.",
      composition: "Mercury is composed mainly of iron and nickel with a rocky surface.",
      orbit: "Mercury completes one orbit around the Sun every 88 Earth days.",
      interesting: "Mercury is the smallest planet in our solar system and the closest to the Sun."
    }
  },
  {
    name: 'Venus',
    color: '#DEB887',
    distance: 7,
    size: 0.9,
    // Venus rotates once every 243 Earth days (retrograde)
    rotationSpeed: -0.004,
    // Venus orbits the Sun every 225 Earth days
    orbitalSpeed: 0.035,
    facts: {
      atmosphere: "Venus has a thick atmosphere composed mainly of carbon dioxide, creating a strong greenhouse effect.",
      temperature: "Surface temperature is about 462°C, making it the hottest planet in our solar system.",
      moons: "Venus has no moons.",
      composition: "Venus is composed of a rocky core, mantle, and crust similar to Earth.",
      orbit: "Venus takes 225 Earth days to orbit the Sun.",
      interesting: "Venus rotates backwards compared to most other planets."
    }
  },
  {
    name: 'Earth',
    color: '#4169E1',
    distance: 10,
    size: 1,
    // Earth rotates once every 24 hours
    rotationSpeed: 0.1,
    // Earth orbits the Sun every 365.25 days
    orbitalSpeed: 0.029,
    facts: {
      atmosphere: "Earth's atmosphere is composed mainly of nitrogen (78%) and oxygen (21%).",
      temperature: "Average surface temperature is 15°C, perfect for liquid water and life.",
      moons: "Earth has one moon, which influences our tides and stabilizes our axis.",
      composition: "Earth has a rocky crust, mantle, and iron-nickel core.",
      orbit: "Earth takes 365.25 days to orbit the Sun.",
      interesting: "Earth is the only known planet with liquid water on its surface and confirmed life."
    }
  },
  {
    name: 'Mars',
    color: '#CD5C5C',
    distance: 13,
    size: 0.5,
    // Mars rotates once every 24.6 Earth hours
    rotationSpeed: 0.097,
    // Mars orbits the Sun every 687 Earth days
    orbitalSpeed: 0.024,
    facts: {
      atmosphere: "Mars has a thin atmosphere composed mainly of carbon dioxide.",
      temperature: "Temperature ranges from -140°C to 20°C.",
      moons: "Mars has two small moons: Phobos and Deimos.",
      composition: "Mars has a rocky, iron-rich surface giving it its red color.",
      orbit: "Mars takes 687 Earth days to orbit the Sun.",
      interesting: "Mars has the largest volcano in the solar system, Olympus Mons."
    }
  },
  {
    name: 'Jupiter',
    color: '#DAA520',
    distance: 17,
    size: 2.2,
    // Jupiter rotates once every 10 Earth hours
    rotationSpeed: 0.24,
    // Jupiter orbits the Sun every 11.86 Earth years
    orbitalSpeed: 0.013,
    facts: {
      atmosphere: "Jupiter's atmosphere is mainly hydrogen and helium, with colorful bands and storms.",
      temperature: "Average cloud temperature is -110°C.",
      moons: "Jupiter has 79 known moons, with the four largest called the Galilean moons.",
      composition: "Jupiter is a gas giant with a small rocky core.",
      orbit: "Jupiter takes 11.86 Earth years to orbit the Sun.",
      interesting: "Jupiter's Great Red Spot is a giant storm that has been raging for at least 400 years."
    }
  },
  {
    name: 'Saturn',
    color: '#F4A460',
    distance: 21,
    size: 1.8,
    // Saturn rotates once every 10.7 Earth hours
    rotationSpeed: 0.22,
    // Saturn orbits the Sun every 29.46 Earth years
    orbitalSpeed: 0.009,
    facts: {
      atmosphere: "Saturn's atmosphere is primarily hydrogen and helium.",
      temperature: "Average temperature is -178°C.",
      moons: "Saturn has 82 confirmed moons and spectacular rings made of ice and rock.",
      composition: "Saturn is a gas giant with a small rocky core.",
      orbit: "Saturn takes 29.46 Earth years to orbit the Sun.",
      interesting: "Saturn's density is so low that it would float in a giant bathtub of water."
    }
  },
  {
    name: 'Uranus',
    color: '#87CEEB',
    distance: 25,
    size: 1.3,
    // Uranus rotates once every 17 Earth hours (retrograde)
    rotationSpeed: -0.14,
    // Uranus orbits the Sun every 84 Earth years
    orbitalSpeed: 0.006,
    facts: {
      atmosphere: "Uranus's atmosphere is mainly hydrogen, helium, and methane.",
      temperature: "Average temperature is -224°C.",
      moons: "Uranus has 27 known moons.",
      composition: "Uranus is an ice giant with a rocky core.",
      orbit: "Uranus takes 84 Earth years to orbit the Sun.",
      interesting: "Uranus rotates on its side, likely due to a massive collision in its past."
    }
  },
  {
    name: 'Neptune',
    color: '#1E90FF',
    distance: 28,
    size: 1.2,
    // Neptune rotates once every 16 Earth hours
    rotationSpeed: 0.15,
    // Neptune orbits the Sun every 165 Earth years
    orbitalSpeed: 0.005,
    facts: {
      atmosphere: "Neptune's atmosphere contains hydrogen, helium, and methane.",
      temperature: "Average temperature is -214°C.",
      moons: "Neptune has 14 known moons.",
      composition: "Neptune is an ice giant with a rocky core.",
      orbit: "Neptune takes 165 Earth years to orbit the Sun.",
      interesting: "Neptune has the strongest winds in the solar system, reaching 2,100 km/h."
    }
  }
];