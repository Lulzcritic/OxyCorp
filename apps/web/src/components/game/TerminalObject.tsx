/**
 * Terminal Object Component
 * 
 * Interactive 3D terminal mesh that players can approach and interact with.
 * Uses the terminal.glb model asset. Displays terminal label and shows
 * a subtle white glow when the player can interact with it.
 */

import { useRef, useEffect, useMemo } from 'react';
import { Mesh, Group, MeshStandardMaterial, Color } from 'three';
import { Text, useGLTF } from '@react-three/drei';
import { useInteractionStore } from '../../services/InteractionStore';
import { useFrame } from '@react-three/fiber';

const TERMINAL_MODEL_PATH = '/models/terminal.glb';

const WHITE = new Color('#ffffff');

interface TerminalObjectProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  terminalType: string;
  label: string;
}

export default function TerminalObject({
  position,
  rotation,
  terminalType,
  label,
}: TerminalObjectProps) {
  const groupRef = useRef<Group>(null);
  const meshesRef = useRef<Mesh[]>([]);
  const hoveredTerminal = useInteractionStore((s) => s.hoveredTerminal);
  const isHovered = hoveredTerminal === terminalType;

  // Load and clone the terminal GLB model
  const { scene } = useGLTF(TERMINAL_MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Collect all meshes, tag them for raycasting, clone materials for independent glow
  useEffect(() => {
    const meshes: Mesh[] = [];

    clonedScene.traverse((child) => {
      if ((child as Mesh).isMesh) {
        const mesh = child as Mesh;
        meshes.push(mesh);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Tag every mesh for raycasting identification
        mesh.userData = {
          isTerminal: true,
          terminalType,
          label,
        };

        // Clone material so each terminal instance is independent
        const mat = mesh.material as MeshStandardMaterial;
        if (mat && mat.isMeshStandardMaterial) {
          const clonedMat = mat.clone();
          clonedMat.emissive = WHITE;
          clonedMat.emissiveIntensity = 0.001;
          mesh.material = clonedMat;
        }
      }
    });

    meshesRef.current = meshes;
  }, [clonedScene, terminalType, label]);

  // Animate white emissive glow: slight glow when hovered, none otherwise
  useFrame(() => {
    for (const mesh of meshesRef.current) {
      const material = mesh.material as MeshStandardMaterial;
      if (material && material.emissiveIntensity !== undefined) {
        const targetIntensity = isHovered ? 0.03 : 0;
        material.emissiveIntensity += (targetIntensity - material.emissiveIntensity) * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Terminal GLB Model - rotated 90° to align with label facing direction */}
      <primitive object={clonedScene} scale={[2, 2, 2]} rotation={[0, Math.PI / 2, 0]} />

      {/* Terminal Label */}
      <Text
        position={[0, 2, 0.2]}
        fontSize={0.15}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {label}
      </Text>

      {/* Subtle white point light - only visible on hover */}
      <pointLight
        position={[-0.5, 1.5, 0]}
        color="#00ff4cff"
        intensity={isHovered ? 2 : 0}
        distance={5}
        decay={2}
      />
    </group>
  );
}

// Preload the terminal model
useGLTF.preload(TERMINAL_MODEL_PATH);
