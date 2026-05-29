/**
 * Bunker Scene Component
 * 
 * Main 3D scene for the bunker environment using React Three Fiber.
 * Renders bunker model, player controller, terminals, and lighting.
 */

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, RigidBody, MeshCollider } from '@react-three/rapier';
import { Environment, useGLTF } from '@react-three/drei';
import PlayerController from './PlayerController';
import TerminalObject from './TerminalObject';
import { TerminalType } from '../../types/terminal';
import { useEditorStore } from '../../services/EditorStore';

function BunkerModel() {
  const { scene } = useGLTF('/models/bunker_inside.glb');
  return (
    <RigidBody type="fixed" colliders={false}>
      <MeshCollider type="trimesh">
        <primitive object={scene} position={[0, 0, -50]} scale={[10, 10, 10]} />
      </MeshCollider>
    </RigidBody>
  );
}

function Terminals() {
  return (
    <>
        <TerminalObject
          terminalType={TerminalType.CRYOPOD}
          label="NEURAL CONDITIONING"
          position={[11.37, 0, -34.63]}
          rotation={[0, 3.5, 0]}
        />
        <TerminalObject
          terminalType={TerminalType.CONTROL_CENTER}
          label="OPERATIONS COMMAND"
          position={[16.37, 0, -39.05]}
          rotation={[0, -1.5, 0]}
        />
        <TerminalObject
          terminalType={TerminalType.COMM}
          label="COMMUNICATIONS"
          position={[5.73, 0, -34.72]}
          rotation={[0, 3, 0]}
        />
        <TerminalObject
          terminalType={TerminalType.BUNKER_MANAGEMENT}
          label="INFRASTRUCTURE"
          position={[11.3, 0, -45.13]}
          rotation={[0, 0, 0]}
        />
        <TerminalObject
          terminalType={TerminalType.MARKET}
          label="LOGISTICS & TRADE"
          position={[6.3, 0, -45.07]}
          rotation={[0, 0, 0]}
        />
        <TerminalObject
          terminalType={TerminalType.WAR_ROOM}
          label="TACTICAL COMMAND"
          position={[7.37, 0, -39.51]}
          rotation={[0, -1.5, 0]}
        />
    </>
  );
}

function Lighting() {
  return (
    <>
      {/* Very dim ambient light for grimdark atmosphere */}
      <ambientLight intensity={0.1} color="#0A0A0A" />

      {/* Directional light for shadows */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  );
}

export default function BunkerScene() {
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
          position: [-6, 4, -34],
        }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            {/* Environment */}
            <Lighting />
            <BunkerModel />

            {/* Player */}
            <PlayerController />

            {/* Terminals */}
            <Terminals />

            {/* HDR Environment for better lighting */}
            <Environment preset="night" />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Bottom-left overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: '#00FF9D',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 15px',
          border: '1px solid #00FF9D',
          pointerEvents: 'auto',
          zIndex: 100
        }}
      >
        <div>WASD - MOVE | MOUSE DRAG - ROTATE CAMERA | E - INTERACT | SCROLL - ZOOM</div>
        <button 
          onClick={toggleEditorMode}
          style={{
            marginTop: '10px',
            background: isEditorMode ? '#00FF9D' : 'rgba(0, 0, 0, 0.8)',
            color: isEditorMode ? '#000' : '#00FF9D',
            border: '1px solid #00FF9D',
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
            background: 'rgba(0, 0, 0, 0.85)',
            padding: '12px 20px',
            border: '1px solid #00FF9D',
            borderRadius: '4px',
            zIndex: 100,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '6px' }}>
            PLAYER POSITION (click to copy)
          </div>
          <div
            onClick={handleCopyCoords}
            style={{
              color: copied ? '#FFD700' : '#00FF9D',
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

// Preload bunker model
useGLTF.preload('/models/bunker_inside.glb');
