import { PlanetData } from '../types';

export const planetData: PlanetData[] = [
  {
    name: 'Mercury',
    color: '#A0522D',
    distance: 4,
    size: 0.4,
    rotationSpeed: 0.017,
    orbitalSpeed: 0.047,
    texture: '/textures/mercury.jpg',
    initialAngle: 0,
    eccentricity: 0.2056, // added
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
    size: 0.6,
    rotationSpeed: -0.004,
    orbitalSpeed: 0.035,
    texture: '/textures/venus.jpg',
    initialAngle: 1.5,
    eccentricity: 0.0068, // added
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
    size: 0.6,
    rotationSpeed: 0.1,
    orbitalSpeed: 0.029,
    texture: '/textures/earth.jpg',
    initialAngle: 3,
    eccentricity: 0.017, // added
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
    rotationSpeed: 0.097,
    orbitalSpeed: 0.024,
    texture: '/textures/mars.jpg',
    initialAngle: 4.5,
    eccentricity: 0.093, // added
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
    size: 1.3,
    rotationSpeed: 0.24,
    orbitalSpeed: 0.013,
    texture: '/textures/jupiter.jpg',
    initialAngle: 6,
    eccentricity: 0.049, // added
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
    size: 1.2,
    rotationSpeed: 0.22,
    orbitalSpeed: 0.009,
    texture: '/textures/saturn.jpg',
    ringTexture: '/textures/ring.png',
    initialAngle: 7.5,
    eccentricity: 0.057, // added
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
    size: 0.9,
    rotationSpeed: -0.14,
    orbitalSpeed: 0.006,
    texture: '/textures/uranus.jpg',
    initialAngle: 9,
    eccentricity: 0.046, // added
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
    size: 0.9,
    rotationSpeed: 0.15,
    orbitalSpeed: 0.005,
    texture: '/textures/neptune.jpg',
    initialAngle: 10.5,
    eccentricity: 0.010, // added
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
