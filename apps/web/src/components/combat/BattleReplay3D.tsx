import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import type { BattleLog, BattleDroneState, BattleEvent } from '../../types/battle';

// Simple seeded random matching PlotTerrain
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// Compute terrain height at (x, z) for procedural alignment
function getTerrainHeight(x: number, z: number, noise2D: any, size: number) {
  let noiseVal = noise2D(x * 0.02, z * 0.02) * 3.0;
  noiseVal += noise2D(x * 0.05, z * 0.05) * 1.5;
  noiseVal += noise2D(x * 0.15, z * 0.15) * 0.3;

  const dist = Math.sqrt(x * x + z * z);
  const maxRadius = size / 2;
  const edgeFactor = Math.pow(Math.min(1, dist / maxRadius), 3);
  
  return noiseVal + (edgeFactor * 15);
}

interface BattleReplay3DProps {
  battleLog: BattleLog;
  sectorSeed?: number;
  onClose?: () => void;
}

// 3D Terrain mesh matching PlotTerrain procedurally
function BattleTerrain3D({ seed }: { seed: number }) {
  const size = 100;
  const resolution = 64;

  const { noise2D } = useMemo(() => {
    const srng = mulberry32(seed);
    return { noise2D: createNoise2D(srng) };
  }, [seed]);

  const { geometry } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, resolution, resolution);
    geo.rotateX(-Math.PI / 2);

    const posAttribute = geo.attributes.position;
    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const z = posAttribute.getZ(i);
      const height = getTerrainHeight(x, z, noise2D, size);
      posAttribute.setY(i, height);
    }
    geo.computeVertexNormals();
    return { geometry: geo };
  }, [noise2D, seed]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        color="#2a140a"
        roughness={0.9}
        metalness={0.1}
        flatShading
      />
    </mesh>
  );
}

// Individual drone rendering with animated mesh, lasers, and text
// Helper to compute drone coords based on team and slot index
export function computeDroneCoords(teamId: string, x: number, y: number, noise2D: any): { xPos: number; yPos: number; zPos: number } {
  // Map x (0-4) to xPos [-20, 20]
  const xPos = -20 + x * 10;
  
  // Map y (0-4) to zPos [-30, 30]
  const zPos = -30 + y * 15;

  const yPos = getTerrainHeight(xPos, zPos, noise2D, 100) + 3;
  return { xPos, yPos, zPos };
}

interface Drone3DProps {
  drone: BattleDroneState;
  finalAtk: number;
  noise2D: any;
  damageFloaters: { id: number; text: string; time: number }[];
  dronePositionsRef: React.MutableRefObject<Record<string, THREE.Vector3>>;
}

function Drone3D({ drone, finalAtk, noise2D, damageFloaters, dronePositionsRef }: Drone3DProps) {
  const meshRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const targetPos = useMemo(() => computeDroneCoords(drone.teamId, drone.x, drone.y, noise2D), [drone.teamId, drone.x, drone.y, noise2D]);

  // Initialize position on mount
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(targetPos.xPos, targetPos.yPos, targetPos.zPos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2 + drone.x) * 0.4;
      // Rotation
      meshRef.current.rotation.y += 0.01;
    }

    if (groupRef.current) {
      const lerpSpeed = 4.0;
      
      const currentX = THREE.MathUtils.lerp(groupRef.current.position.x, targetPos.xPos, delta * lerpSpeed);
      const currentZ = THREE.MathUtils.lerp(groupRef.current.position.z, targetPos.zPos, delta * lerpSpeed);
      
      const terrainY = getTerrainHeight(currentX, currentZ, noise2D, 100) + 3;
      const currentY = THREE.MathUtils.lerp(groupRef.current.position.y, terrainY, delta * lerpSpeed);

      groupRef.current.position.set(currentX, currentY, currentZ);

      // Save real-time coordinates for laser beams
      dronePositionsRef.current[drone.id] = groupRef.current.position.clone();
    }
  });

  const color = useMemo(() => {
    switch (drone.variantId) {
      case 'DRONE_GUARDIAN': return '#FFD700'; // Gold
      case 'DRONE_CARRIER': return '#00F3FF'; // Cyan
      case 'DRONE_KAMIKAZE': return '#FF3B30'; // Red
      case 'DRONE_JAMMER': return '#AF52DE'; // Purple
      case 'DRONE_COMMANDO': return '#34C759'; // Green
      default: return '#00FF9D';
    }
  }, [drone.variantId]);

  return (
    <group ref={groupRef}>
      {/* Visual Unit Model */}
      <group ref={meshRef}>
        {drone.variantId === 'DRONE_GUARDIAN' && (
          <mesh castShadow>
            <cylinderGeometry args={[0.8, 1, 1.2, 8]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
          </mesh>
        )}
        {drone.variantId === 'DRONE_CARRIER' && (
          <mesh castShadow>
            <torusGeometry args={[0.7, 0.25, 8, 24]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
          </mesh>
        )}
        {drone.variantId === 'DRONE_KAMIKAZE' && (
          <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.6, 1.5, 4]} />
            <meshStandardMaterial color={color} roughness={0.1} emissive="#660000" />
          </mesh>
        )}
        {drone.variantId === 'DRONE_JAMMER' && (
          <mesh castShadow>
            <octahedronGeometry args={[0.8]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} />
          </mesh>
        )}
        {drone.variantId === 'DRONE_COMMANDO' && (
          <mesh castShadow>
            <capsuleGeometry args={[0.5, 0.8, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.9} />
          </mesh>
        )}

        {/* Thruster Glow */}
        <mesh position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.25, 8, 8]} />
          <meshBasicMaterial color="#FF5500" />
        </mesh>
      </group>

      {/* Floating Stack Healthbar */}
      <Html distanceFactor={15} position={[0, 1.8, 0]}>
        <div style={{
          background: 'rgba(5,5,8,0.92)',
          border: `2px solid ${drone.teamId === 'A' ? '#00F3FF' : '#FF3B30'}`,
          padding: '4px 8px',
          color: '#FFF',
          fontFamily: 'monospace',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          borderRadius: '4px',
          pointerEvents: 'none',
          boxShadow: '0 0 10px rgba(0,0,0,0.8)',
          transform: 'translateX(-50%)'
        }}>
          <div style={{ color: drone.teamId === 'A' ? '#00F3FF' : '#FF3B30', fontWeight: 'bold', fontSize: '9px', marginBottom: '2px' }}>
            {drone.teamId === 'A' ? '⚔ OFFENSE' : '🛡 DEFENSE'}
          </div>
          <div style={{ color: color }}>{drone.variantId.replace('DRONE_', '')}</div>
          <div style={{ color: '#00FF9D', marginTop: '2px' }}>HP: {drone.hp}/{drone.maxHp}</div>
        </div>
      </Html>

      {/* Floating Damage Text Overlays */}
      {damageFloaters.map((floater) => (
        <DamageFloater key={floater.id} text={floater.text} />
      ))}
    </group>
  );
}

// Laser line renderer
function LaserBeam({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const points = useMemo(() => [from, to], [from, to]);
  const lineGeo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <line geometry={lineGeo}>
      <lineBasicMaterial color={color} linewidth={4} transparent opacity={0.9} />
    </line>
  );
}

// Animating floating text
function DamageFloater({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [offsetY, setOffsetY] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      if (elapsed > 1000) {
        clearInterval(interval);
      } else {
        setOffsetY((elapsed / 1000) * 1.5);
        setOpacity(1 - elapsed / 1000);
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <Html distanceFactor={15} position={[0, 2.2 + offsetY, 0]}>
      <div
        ref={ref}
        style={{
          color: '#FF3B30',
          fontFamily: 'monospace',
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: '0 0 4px #000',
          opacity: opacity,
          pointerEvents: 'none',
          transform: 'translateX(-50%)'
        }}
      >
        {text}
      </div>
    </Html>
  );
}

export default function BattleReplay3D({ battleLog, sectorSeed = 42, onClose }: BattleReplay3DProps) {
  const [currentTick, setCurrentTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Track lasers and damage numbers per drone ID
  const [laserTargets, setLaserTargets] = useState<Record<string, THREE.Vector3 | null>>({});
  const [damageFloaters, setDamageFloaters] = useState<Record<string, { id: number; text: string; time: number }[]>>({});
  const dronePositionsRef = useRef<Record<string, THREE.Vector3>>({});

  const maxTick = battleLog.ticks.length - 1;

  const { noise2D } = useMemo(() => {
    const srng = mulberry32(sectorSeed);
    return { noise2D: createNoise2D(srng) };
  }, [sectorSeed]);

  // Global position helper for lasers
  const getDronePosition = (droneId: string) => {
    const drone = droneStates.find((d) => d.id === droneId);
    if (!drone) return new THREE.Vector3(0, 0, 0);
    const { xPos, yPos, zPos } = computeDroneCoords(drone.teamId, drone.x, drone.y, noise2D);
    return new THREE.Vector3(xPos, yPos, zPos);
  };

  const getDroneColor = (droneId: string) => {
    const drone = battleLog.initialState.drones.find((d) => d.id === droneId);
    if (!drone) return '#00FF9D';
    switch (drone.variantId) {
      case 'DRONE_GUARDIAN': return '#FFD700';
      case 'DRONE_CARRIER': return '#00F3FF';
      case 'DRONE_KAMIKAZE': return '#FF3B30';
      case 'DRONE_JAMMER': return '#AF52DE';
      case 'DRONE_COMMANDO': return '#34C759';
      default: return '#00FF9D';
    }
  };

  // Compute drone states for the current tick
  const droneStates = useMemo(() => {
    const states = new Map<string, BattleDroneState>(
      battleLog.initialState.drones.map((d) => [d.id, { ...d }]),
    );

    for (let i = 0; i <= currentTick && i < battleLog.ticks.length; i++) {
      const tick = battleLog.ticks[i];
      for (const event of tick.events) {
        if (event.type === 'MOVE') {
          const drone = states.get(event.droneId);
          if (drone) {
            drone.x = event.to.x;
            drone.y = event.to.y;
          }
        } else if (event.type === 'DAMAGE') {
          const drone = states.get(event.targetId);
          if (drone) {
            drone.hp = event.remainingHp;
          }
        }
      }
    }

    return Array.from(states.values());
  }, [battleLog, currentTick]);

  // Dynamic non-duplicating log messages computation
  const logMessages = useMemo(() => {
    const messages: string[] = [];
    for (let i = 0; i <= currentTick && i < battleLog.ticks.length; i++) {
      const tick = battleLog.ticks[i];
      tick.events.forEach((event) => {
        if (event.type === 'ATTACK') {
          const source = battleLog.initialState.drones.find((d) => d.id === event.sourceId);
          const target = battleLog.initialState.drones.find((d) => d.id === event.targetId);
          messages.push(`[Tick ${i}] ${source?.variantId.replace('DRONE_', '')} attacks ${target?.variantId.replace('DRONE_', '')}`);
        } else if (event.type === 'DAMAGE') {
          const target = battleLog.initialState.drones.find((d) => d.id === event.targetId);
          messages.push(`[Tick ${i}] ${target?.variantId.replace('DRONE_', '')} suffers -${event.amount} HP`);
        } else if (event.type === 'DESTROY') {
          const target = battleLog.initialState.drones.find((d) => d.id === event.targetId);
          messages.push(`[Tick ${i}] 💥 ${target?.variantId.replace('DRONE_', '')} DESTROYED`);
        }
      });
    }
    return messages.reverse().slice(0, 50); // Show most recent logs at the top (capped at 50)
  }, [currentTick, battleLog]);

  // Handle battle ticks events (lasers, floaters)
  useEffect(() => {
    if (currentTick >= battleLog.ticks.length) return;
    const tick = battleLog.ticks[currentTick];
    const newLasers: Record<string, THREE.Vector3 | null> = {};
    const newFloaters: Record<string, { id: number; text: string; time: number }[]> = {};

    tick.events.forEach((event) => {
      if (event.type === 'ATTACK') {
        // Find target position
        const target = droneStates.find((d) => d.id === event.targetId);
        if (target) {
          const { xPos, yPos, zPos } = computeDroneCoords(target.teamId, target.x, target.y, noise2D);
          newLasers[event.sourceId] = new THREE.Vector3(xPos, yPos, zPos);
        }
      } else if (event.type === 'DAMAGE') {
        if (!newFloaters[event.targetId]) newFloaters[event.targetId] = [];
        newFloaters[event.targetId].push({
          id: Math.random(),
          text: `-${event.amount}`,
          time: Date.now()
        });
      }
    });

    setLaserTargets(newLasers);
    setDamageFloaters(newFloaters);

    // Fade lasers after 400ms
    const timer = setTimeout(() => {
      setLaserTargets({});
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTick]);

  // Tick advancement interval
  useEffect(() => {
    if (!isPlaying) return;
    if (currentTick >= maxTick) {
      setIsPlaying(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentTick((prev) => Math.min(prev + 1, maxTick));
    }, 1500 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentTick, maxTick, speed]);

  const winnerName = battleLog.meta.winnerId === battleLog.meta.swarmAId
    ? battleLog.meta.swarmAName
    : battleLog.meta.winnerId === battleLog.meta.swarmBId
      ? battleLog.meta.swarmBName
      : 'DRAW';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#070708',
      zIndex: 9999,
      display: 'grid',
      gridTemplateColumns: '1fr 340px',
      fontFamily: 'monospace',
      color: '#E5E7EB',
      overflow: 'hidden'
    }}>
      
      {/* 3D Canvas Screen */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 15, 30], fov: 60 }} shadows>
          <color attach="background" args={['#140804']} />
          <fog attach="fog" args={['#140804', 20, 90]} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} color="#ff8866" />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
            color="#fff0e0"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} color="#00ff9d" />

          <BattleTerrain3D seed={sectorSeed} />

          {/* Render Drones (Hide if dead) */}
          {droneStates.map((drone) => {
            if (drone.hp <= 0) return null;
            return (
              <Drone3D
                key={drone.id}
                drone={drone}
                finalAtk={0}
                noise2D={noise2D}
                damageFloaters={damageFloaters[drone.id] || []}
                dronePositionsRef={dronePositionsRef}
              />
            );
          })}

          {/* Render Lasers globally */}
          {Object.entries(laserTargets).map(([sourceId, targetPos]) => {
            if (!targetPos) return null;
            const fromPos = getDronePosition(sourceId);
            const color = getDroneColor(sourceId);
            return (
              <LaserBeam key={sourceId} from={fromPos} to={targetPos} color={color} />
            );
          })}

          <OrbitControls maxPolarAngle={Math.PI / 2 - 0.05} minDistance={10} maxDistance={60} />
        </Canvas>

        {/* Overlay HUD controls */}
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15,15,18,0.92)',
          border: '1px solid #1F1F24',
          borderRadius: '6px',
          padding: '16px 24px',
          display: 'flex',
          gap: '20px',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          pointerEvents: 'auto',
          zIndex: 100
        }}>
          <button
            onClick={() => {
              if (currentTick >= maxTick) {
                setCurrentTick(0);
              }
              setIsPlaying(!isPlaying);
            }}
            style={{
              background: '#FFD700',
              color: '#070708',
              border: 'none',
              padding: '8px 16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}
          >
            {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
          </button>
          
          <button
            onClick={() => { setCurrentTick(maxTick); setIsPlaying(false); }}
            style={{
              background: 'transparent',
              color: '#FFD700',
              border: '1px solid #FFD700',
              padding: '7px 14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}
          >
            ⏭ SKIP
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>SPEED:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ background: '#070708', color: '#FFD700', border: '1px solid #333', padding: '4px', fontFamily: 'monospace' }}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>

          <div style={{ color: '#E5E7EB', fontSize: '0.9rem', fontWeight: 'bold' }}>
            TICK: {currentTick} / {maxTick}
          </div>
        </div>

        {/* Back Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(15,15,18,0.92)',
              border: '1px solid #FF3B30',
              color: '#FF3B30',
              padding: '8px 16px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              borderRadius: '3px',
              zIndex: 100
            }}
          >
            ✕ EXIT VIEW
          </button>
        )}
      </div>

      {/* Sidebar: Battle Info & Live Logs */}
      <div style={{
        background: '#0F0F12',
        borderLeft: '1px solid #1F1F24',
        padding: '24px 20px',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        gap: '20px',
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Swarm Details */}
        <div>
          <h2 style={{ color: '#FFD700', fontSize: '1.2rem', margin: '0 0 16px', borderBottom: '1px solid #1F1F24', paddingBottom: '10px' }}>
            TACTICAL REPLAY
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <div>
              OFFENSE:{' '}
              <span style={{ color: '#00F3FF', fontWeight: 'bold' }}>
                {battleLog.meta.swarmAName}
              </span>
            </div>
            <div>
              DEFENSE:{' '}
              <span style={{ color: '#FF3B30', fontWeight: 'bold' }}>
                {battleLog.meta.swarmBName}
              </span>
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        <div style={{
          background: 'rgba(0,255,157,0.05)',
          border: '1px solid #00FF9D',
          borderRadius: '4px',
          padding: '12px 16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#888', letterSpacing: '0.08em', marginBottom: '4px' }}>
            MATCH RESOLUTION
          </div>
          <div style={{ fontSize: '1.1rem', color: '#00FF9D', fontWeight: 'bold' }}>
            VICTOR: {winnerName.toUpperCase()}
          </div>
        </div>

        {/* Live Attack Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 10px', textTransform: 'uppercase' }}>
            Battle Broadcast Feed
          </h3>
          <div style={{
            flex: 1,
            background: '#070708',
            border: '1px solid #1F1F24',
            borderRadius: '4px',
            padding: '12px',
            overflowY: 'auto',
            fontSize: '0.78rem',
            lineHeight: '1.5',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {logMessages.length === 0 ? (
              <div style={{ color: '#444', textAlign: 'center', marginTop: '20px' }}>
                Awaiting telemetry feed...
              </div>
            ) : (
              logMessages.map((msg, index) => (
                <div key={index} style={{
                  color: msg.includes('💥') ? '#FF3B30' : msg.includes('attacks') ? '#FFD700' : '#888',
                  borderBottom: '1px solid #0F0F12',
                  paddingBottom: '4px'
                }}>
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
