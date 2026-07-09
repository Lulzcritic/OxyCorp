import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, MeshCollider } from '@react-three/rapier';
import { Environment, useGLTF, Html } from '@react-three/drei';
import PlayerController from './PlayerController';
import PlayerModel from './PlayerModel';
import MartianTerrain from './MartianTerrain';
import MartianLighting from './MartianLighting';
import { useEditorStore } from '../../services/EditorStore';
import { useNavigate } from 'react-router-dom';

function BunkerExterior() {
  const { scene } = useGLTF('/models/bunker.glb');
  const navigate = useNavigate();

  return (
    <group position={[0, -1, 0]}>
      {/* Visual model and exact mesh collider */}
      <RigidBody type="fixed" colliders={false}>
        <MeshCollider type="trimesh">
          <primitive object={scene} scale={[0.3, 0.3, 0.3]} />
        </MeshCollider>
      </RigidBody>

      {/* Entrance Trigger Zone */}
      <mesh
        position={[-6.06, 0.38, -3.86]} // Estimate: adjust based on actual bunker door location
        visible={false}
        userData={{
          isTerminal: true,
          terminalType: 'BUNKER_DOOR',
          label: 'ENTER BUNKER',
          onInteract: () => navigate('/bunker'),
        }}
      >
        <boxGeometry args={[4, 4, 2]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </group>
  );
}

function Vehicle() {
  const { scene } = useGLTF('/models/vehicle.glb');
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as any).isMesh) {
        child.userData = {
          isTerminal: true,
          terminalType: 'VEHICLE_MAP',
          label: 'NAVIGATION MAP',
        };
      }
    });
    return clone;
  }, [scene]);

  return (
    <RigidBody type="fixed" colliders="hull" position={[9.54, -0.10, -22.38]} rotation={[0, -Math.PI / 4, 0]}>
      <primitive object={clonedScene} scale={[2, 2, 2]} />
    </RigidBody>
  );
}

function RefineryBuilding() {
  const { scene } = useGLTF('/models/Refinery.gltf');
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as any).isMesh) {
        child.userData = {
          isTerminal: true,
          terminalType: 'REFINERY',
          label: 'REFINERY SYSTEM',
        };
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={[-30.5, 0.45, -10.97]}>
      <RigidBody type="fixed" colliders={false}>
        <MeshCollider type="trimesh">
          <primitive object={clonedScene} scale={[25, 25, 25]} />
        </MeshCollider>
      </RigidBody>
    </group>
  );
}

function ForgeBuilding() {
  const { scene } = useGLTF('/models/Refinery.gltf');
  
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as any).isMesh) {
        child.userData = {
          isTerminal: true,
          terminalType: 'CRAFTING',
          label: 'FORGE SYSTEM',
        };
      }
    });
    return clone;
  }, [scene]);

  return (
    <group position={[25, 0.45, -10]} rotation={[0, Math.PI, 0]}>
      <RigidBody type="fixed" colliders={false}>
        <MeshCollider type="trimesh">
          <primitive object={clonedScene} scale={[20, 20, 20]} />
        </MeshCollider>
      </RigidBody>
    </group>
  );
}

export default function HeadquartersScene() {
  const { isEditorMode, toggleEditorMode, playerCoords } = useEditorStore();
  const [copied, setCopied] = React.useState(false);

  const coordString = `[${playerCoords[0]}, ${playerCoords[1]}, ${playerCoords[2]}]`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(coordString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 5, 10],
        }}
        shadows
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
      >
        {/* Martian sky/fog */}
        <color attach="background" args={['#2a1005']} />
        <fog attach="fog" args={['#2a1005', 20, 150]} />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <MartianLighting />
            
            {/* The procedural crater floor */}
            <MartianTerrain seed={42} size={200} resolution={100} />

            {/* HQ Structures */}
            <BunkerExterior />
            <Vehicle />
            <RefineryBuilding />
            <ForgeBuilding />

            {/* Local Player */}
            <PlayerController
              spawnPosition={[-6.06, 2, -5]}
            />

            {/* Environment map for realistic PBR reflections */}
            <Environment preset="sunset" background={false} />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Bottom-left overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: '#ffaa88',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          background: 'rgba(20, 5, 0, 0.7)',
          padding: '10px 15px',
          border: '1px solid #ffaa88',
          pointerEvents: 'auto',
          zIndex: 100
        }}
      >
        <div>WASD - MOVE | MOUSE DRAG - ROTATE CAMERA | E - INTERACT | SCROLL - ZOOM</div>
        <button 
          onClick={toggleEditorMode}
          style={{
            marginTop: '10px',
            background: isEditorMode ? '#ffaa88' : 'rgba(0, 0, 0, 0.8)',
            color: isEditorMode ? '#000' : '#ffaa88',
            border: '1px solid #ffaa88',
            padding: '5px 10px',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            display: 'block'
          }}
        >
          {isEditorMode ? 'DISABLE EDITOR MODE' : 'ENABLE EDITOR MODE'}
        </button>
      </div>

      {/* Coordinate display when editor mode is active */}
      {isEditorMode && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'monospace',
            fontSize: '1.1rem',
            background: 'rgba(20, 5, 0, 0.85)',
            padding: '12px 20px',
            border: '1px solid #ffaa88',
            borderRadius: '4px',
            zIndex: 100,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ color: '#aaa', fontSize: '0.75rem', marginBottom: '6px' }}>
            HQ COORDINATES (click to copy)
          </div>
          <div
            onClick={handleCopyCoords}
            style={{
              color: copied ? '#FFD700' : '#ffaa88',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: '1.3rem',
              letterSpacing: '1px',
              transition: 'color 0.2s',
            }}
          >
            {copied ? '✓ Copied!' : coordString}
          </div>
        </div>
      )}
    </div>
  );
}

// Preload models
useGLTF.preload('/models/bunker.glb');
useGLTF.preload('/models/vehicle.glb');
useGLTF.preload('/models/Refinery.gltf');

