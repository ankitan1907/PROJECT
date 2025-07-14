import React from 'react';
import { Line } from '@react-three/drei';

interface OrbitProps {
  orbitRadiusX: number;
  orbitRadiusY: number;
}

const Orbit: React.FC<OrbitProps> = ({ orbitRadiusX, orbitRadiusY }) => {
  const points = [];

  for (let i = 0; i <= 360; i++) {
    const angle = (i * Math.PI) / 180;
    const x = orbitRadiusX * Math.cos(angle);
    const z = orbitRadiusY * Math.sin(angle);
    points.push([x, 0, z]);
  }

  return (
    <Line
      points={points}
      color="white"
      lineWidth={1}
      dashed
      dashSize={0.3}
      gapSize={0.2}
    />
  );
};

export default Orbit;
