import { useRef, useEffect, useMemo } from 'react';
import { Group } from 'three';
import { Text, useGLTF } from '@react-three/drei';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useInteractionStore } from '../../services/InteractionStore';

interface NPCObjectProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  npcId: string;
  npcName: string;
  npcRole: string;
  color?: string;
  avatar?: string;
}

export default function NPCObject({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  npcId,
  npcName,
  npcRole,
  color = '#00F3FF',
  avatar = '🧭',
}: NPCObjectProps) {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF('/models/player.glb');
  
  // Clone skeleton for independent instances
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const hoveredTerminal = useInteractionStore((s) => s.hoveredTerminal);
  const isHovered = hoveredTerminal === `NPC_${npcId}`;

  const setDialogueActive = useInteractionStore((s) => s.setDialogueActive);
  const setActiveNpcId = useInteractionStore((s) => s.setActiveNpcId);

  // Set up interaction data on the group mesh so PlayerController detects it
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData = {
        isTerminal: true,
        terminalType: `NPC_${npcId}`,
        label: `TALK TO ${npcName.toUpperCase()}`,
        onInteract: () => {
          setActiveNpcId(npcId);
          setDialogueActive(true);
        },
      };
    }
  }, [npcId, npcName, setDialogueActive, setActiveNpcId]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* 3D Visual character model */}
      <primitive object={clonedScene} scale={[1, 1, 1]} castShadow receiveShadow />

      {/* Halo ring beneath NPC's feet */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshBasicMaterial color={color} opacity={isHovered ? 0.8 : 0.3} transparent />
      </mesh>

      {/* Floating Name/Role Info */}
      <Text
        position={[0, 2.4, 0]}
        fontSize={0.16}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {`${avatar} ${npcName}\n[${npcRole.toUpperCase()}]`}
      </Text>
    </group>
  );
}

useGLTF.preload('/models/player.glb');
