/**
 * Plot Scene Component
 * 
 * Main 3D scene for individual player plots using React Three Fiber.
 * Instantiates the procedural PlotTerrain and physics environment.
 */

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Environment } from '@react-three/drei';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import PlayerController from './PlayerController';
import PlotTerrain from './PlotTerrain';
import MartianLighting from './MartianLighting';
import { useEditorStore } from '../../services/EditorStore';
import { usePlotStore } from '../../services/PlotStore';

interface PlotSceneProps {
  seed: number;
  isOwned: boolean;
}

export default function PlotScene({ seed, isOwned }: PlotSceneProps) {
  const { isEditorMode, toggleEditorMode, playerCoords } = useEditorStore();
  const resetPlot = usePlotStore((s) => s.resetPlot);
  const setResources = usePlotStore((s) => s.setResources);
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = useState(false);

  // Clear harvest states when entering a new plot seed
  useEffect(() => {
    resetPlot();
  }, [seed, resetPlot]);

  // Load sector resources from server to determine active/depleted node visual states
  useEffect(() => {
    if (!id) return;
    const loadSectorResources = async () => {
      try {
        const res = await apiFetch(`/map/sector/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.resources) {
            const richness = data.resources.richness || 0.5;
            const cap = data.resources.capacity !== undefined ? data.resources.capacity : Math.floor(1000 * richness);
            const qty = data.resources.quantity !== undefined ? data.resources.quantity : cap;
            const harvested = Array.isArray(data.resources.harvested) ? data.resources.harvested : [];
            setResources(qty, cap, harvested);
          }
        }
      } catch (err) {
        console.error('Failed to load sector resources:', err);
      }
    };
    loadSectorResources();
  }, [id, seed, setResources]);

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
          position: [0, 5, 10], // Player starts at origin, camera offset
        }}
        shadows
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
      >
        {/* Slightly clearer sky than HQ for farming plots */}
        <color attach="background" args={['#3a1a0a']} />
        <fog attach="fog" args={['#3a1a0a', 30, 200]} />

        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <MartianLighting />
            
            {/* The procedural terrain specifically matching the seed */}
            <PlotTerrain seed={seed} size={200} resolution={100} isOwned={isOwned} />

            {/* Player Character */}
            <PlayerController spawnPosition={[0, 1, 0]} />

            {/* PBR Reflections */}
            <Environment preset="sunset" background={false} />
          </Physics>
        </Suspense>
      </Canvas>

      {/* Interface Overlays */}
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
        <div>PLOT SEED // {seed}</div>
        <div style={{ marginTop: 8 }}>WASD - MOVE | MOUSE DRAG - ROTATE CAMERA | E - INTERACT | SCROLL - ZOOM</div>
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
            COORDINATES (click to copy)
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
