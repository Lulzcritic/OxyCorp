// src/components/RemoteAvatar.tsx
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';

type PeerLike = { p: [number, number, number]; ry: number; username?: string };

type Props = {
  peer: PeerLike;
  /** chemin de l'avatar GLB à utiliser pour les autres joueurs */
  modelUrl?: string;
  /** tuning du lissage / orientation */
  followLerp?: number;   // 0..1 par seconde (sera clampé frame-wise)
  rotLerp?: number;      // idem
  scale?: number;
};

export default function RemoteAvatar({
  peer,
  modelUrl = '/models/player.glb',
  followLerp = 10,     // plus grand => suit plus vite
  rotLerp = 12,
  scale = 1,
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(...peer.p));
  const tmp = useMemo(() => ({
    v3: new THREE.Vector3(),
    q: new THREE.Quaternion(),
    qTarget: new THREE.Quaternion(),
    euler: new THREE.Euler(0, 0, 0),
    last: new THREE.Vector3(...peer.p),
  }), []);

  // Charge le modèle + animations
  const gltf = useGLTF(modelUrl);
  const sceneClone = useMemo(() => SkeletonUtils.clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions, mixer } = useAnimations((gltf as any).animations, sceneClone);

  // Heuristique de noms d’anims
  const animNames = useMemo(() => {
    const names = Object.keys(actions ?? {});
    const find = (sub: string) => names.find(n => n.toLowerCase().includes(sub));
    return {
      idle: find('idle') ?? find('stand') ?? null,
      walk: find('walk') ?? find('run') ?? 'Armature|walking_man|baselayer',
    };
  }, [actions]);

  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const setAction = (name: string | null, fade: number) => {
    if (!name || !actions?.[name]) {
      // si aucune idle dispo, on stoppe simplement
      currentAction.current?.fadeOut(fade);
      currentAction.current = null;
      return;
    }
    const next = actions[name]!;
    if (currentAction.current === next) return;
    currentAction.current?.fadeOut(fade);
    next.reset().fadeIn(fade).setLoop(THREE.LoopRepeat, Infinity).play();
    currentAction.current = next;
  };

  // Init transform
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(peer.p[0], peer.p[1], peer.p[2]);
    groupRef.current.rotation.y = peer.ry ?? 0;
    groupRef.current.scale.setScalar(scale);
    // idle au démarrage si dispo
    setAction(animNames.idle ?? animNames.walk, 0.1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  useFrame((_, dt) => {
    mixer.update(dt);

    // Lerp position vers la cible
    targetPos.current.set(peer.p[0], peer.p[1], peer.p[2]);
    const ref = groupRef.current!;
    if (!ref) return;

    // vitesse estimée (dans l'espace monde) pour décider de l'anim
    const before = tmp.last.clone();
    const lerpFactor = THREE.MathUtils.clamp(dt * followLerp, 0, 1);
    ref.position.lerp(targetPos.current, lerpFactor);

    const dist = before.distanceTo(ref.position);
    const speed = dist / Math.max(dt, 1e-4); // m/s

    // Orientation : vers peer.ry (source) — lissée
    tmp.v3.copy(targetPos.current).sub(groupRef.current!.position);
    tmp.v3.y = 0;
    if (tmp.v3.lengthSq() > 1e-6) {
        const yaw = Math.atan2(tmp.v3.x, tmp.v3.z);
        tmp.euler.set(0, yaw, 0);
        tmp.qTarget.setFromEuler(tmp.euler);
    }
    tmp.q.copy(ref.quaternion).slerp(tmp.qTarget, THREE.MathUtils.clamp(dt * rotLerp, 0, 1));
    ref.quaternion.copy(tmp.q);

    // Switch d'anim
    const moving = speed > 0.2; // seuil m/s
    if (moving) setAction(animNames.walk, 0.15);
    else setAction(animNames.idle ?? null, 0.2);

    // garde en mémoire pour la vitesse
    tmp.last.copy(ref.position);
  });

  return (
    <group ref={groupRef}>
      {/* Model */}
      <primitive object={sceneClone} dispose={null} />
      <mesh position={[0, 2.2, 0]}>
        <planeGeometry args={[1.2, 0.3]} />
        <meshBasicMaterial transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Drei GLTF loader optimise les assets si tu appelles useGLTF.preload('/models/player.glb')
useGLTF.preload?.('/models/player.glb');
