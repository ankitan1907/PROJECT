import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useStore } from '../store';
import Planet from './Planet';
import { planetData } from '../data/planetData';

const SolarSystem: React.FC = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  const setSelectedPlanet = useStore((state) => state.setSelectedPlanet);
  const setPlanetPosition = useStore((state) => state.setPlanetPosition);
  const selectedPlanet = useStore((state) => state.selectedPlanet);
  const planetPosition = useStore((state) => state.planetPosition);

  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

  const { camera, gl } = useThree();
  const controls = useRef<OrbitControls>();

  // Setup OrbitControls only once
  useEffect(() => {
    controls.current = new OrbitControls(camera, gl.domElement);
    controls.current.enableDamping = true;
    controls.current.dampingFactor = 0.1;
    controls.current.minDistance = 5;
    controls.current.maxDistance = 100;
    controls.current.target.set(0, 0, 0);
    controls.current.update();

    // Cleanup
    return () => {
      controls.current?.dispose();
    };
  }, [camera, gl]);

  // Rotate the sun continuously
  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y = clock.getElapsedTime() * 0.1;
    }
  });

  // Smoothly move camera and update controls target on selected planet
  useFrame(() => {
    if (!controls.current) return;

    if (selectedPlanet && planetPosition) {
      const offset = new THREE.Vector3(0, 2, 5);
      const desiredPos = planetPosition.clone().add(offset);

      // Smoothly move camera position toward the desired position
      camera.position.lerp(desiredPos, 0.05);

      // Smoothly move controls target to planet position
      controls.current.target.lerp(planetPosition, 0.05);

      controls.current.update();
    } else {
      // No selection - reset to default position and target smoothly
      const defaultCamPos = new THREE.Vector3(0, 30, 50);
      const defaultTarget = new THREE.Vector3(0, 0, 0);

      camera.position.lerp(defaultCamPos, 0.05);
      controls.current.target.lerp(defaultTarget, 0.05);

      controls.current.update();
    }
  });

  return (
    <group>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      <mesh
        ref={sunRef}
        position={[0, 0, 0]}
        onClick={() => {
          setSelectedPlanet('Sun');
          setPlanetPosition(new THREE.Vector3(0, 0, 0));
        }}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          map={sunTexture}
          emissive="#FDB813"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0}
        />
        <pointLight intensity={0.8} distance={100} decay={2} />
      </mesh>

      {planetData.map((planet, index) => (
        <Planet
          key={planet.name}
          {...planet}
          initialAngle={(index / planetData.length) * Math.PI * 2}
          onClick={(name, position) => {
            setSelectedPlanet(name);
            setPlanetPosition(position);
          }}
        />
      ))}
    </group>
  );
};

export default SolarSystem;
