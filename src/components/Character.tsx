import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useControlStore } from '../game/useControlStore';
import { useCharacterControls } from '../game/useCharacterControls';
import type { Group } from 'three';
import * as THREE from 'three';

type MovementInput = {
  forward: number; // -1..1 (avant +)
  right: number;   // -1..1 (droite +)
  run: boolean;
};

const selectMovement = (s: any): MovementInput => ({
  forward: s.forward,
  right:   s.right,
  run:     s.run,
});

const Character = forwardRef<Group>((props, externalRef) => {
  const { scene, animations } = useGLTF('/models/player.glb');
  const { actions, mixer } = useAnimations(animations, scene);

  // --- Réfs ---
  const rbRef = useRef<RapierRigidBody | null>(null);
  const visualRef = useRef<Group>(null!); // groupe visuel piloté par la physique

  // Expose le group visuel à l'extérieur (pour tes proximités)
  useEffect(() => {
    if (!externalRef) return;
    if (typeof externalRef === 'function') {
      externalRef(visualRef.current);
    } else {
      // @ts-ignore
      externalRef.current = visualRef.current;
    }
  }, [externalRef]);

  // --- Inputs depuis le store (mis à jour par useCharacterControls)
  const forward = useControlStore(s => s.forward);
  const right   = useControlStore(s => s.right);
  const run     = useControlStore(s => s.run);
  const moving  = useControlStore(s => s.moving);

  // --- Branche le hook de contrôle (ne déplace plus, juste axes/moving/run)
  useCharacterControls(visualRef);

  // --- Animations ---
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const walkActionName = 'Armature|walking_man|baselayer';

  useEffect(() => {
    if (!actions[walkActionName]) return;
    const walkAction = actions[walkActionName];

    if (moving) {
      if (currentActionRef.current !== walkAction) {
        currentActionRef.current?.fadeOut(0.2);
        walkAction.reset().fadeIn(0.2).play();
        walkAction.setLoop(THREE.LoopRepeat, Infinity);
        currentActionRef.current = walkAction;
      }
    } else {
      if (currentActionRef.current === walkAction) {
        walkAction.fadeOut(0.3);
        currentActionRef.current = null;
      }
    }
  }, [moving, actions]);

  // --- Locomotion physique ---
  const { baseSpeed, runMultiplier, accel } = useMemo(
    () => ({
      baseSpeed: 3.0,     // m/s (marche)
      runMultiplier: 1.8, // sprint
      accel: 30.0,        // facteur de damping vers la vitesse cible
    }),
    []
  );

  const moveDir = useRef(new THREE.Vector3());
  const camFwd = useRef(new THREE.Vector3());
  const camRight = useRef(new THREE.Vector3());
  const desiredVel = useRef(new THREE.Vector3());
  const targetQuat = useRef(new THREE.Quaternion());
  const tmpEuler = useRef(new THREE.Euler());

  useFrame((state, delta) => {
    mixer.update(delta);

    const rb = rbRef.current;
    if (!rb) return;

    // Reconstruire la direction globale à partir des axes normalisés (forward/right) et de la caméra
    const cam = state.camera;
    camFwd.current.set(0, 0, -1).applyQuaternion(cam.quaternion);
    camFwd.current.y = 0; camFwd.current.normalize();
    camRight.current.copy(camFwd.current).cross(new THREE.Vector3(0, 1, 0)).normalize();

    moveDir.current
      .set(0, 0, 0)
      .addScaledVector(camFwd.current, forward)
      .addScaledVector(camRight.current, right);

    const hasInput = moveDir.current.lengthSq() > 1e-6;
    if (hasInput) moveDir.current.normalize();

    // Vitesse cible
    const speed = (run ? baseSpeed * runMultiplier : baseSpeed);
    desiredVel.current.copy(moveDir.current).multiplyScalar(speed);

    // Vitesse actuelle
    const v = rb.linvel();
    // Damp vers la vitesse cible (XY: on garde y pour la gravité)
    const newVX = THREE.MathUtils.damp(v.x, desiredVel.current.x, accel, delta);
    const newVZ = THREE.MathUtils.damp(v.z, desiredVel.current.z, accel, delta);
    rb.setLinvel({ x: newVX, y: v.y, z: newVZ }, true);

    // Tourner vers la direction de déplacement
    if (hasInput) {
      tmpEuler.current.set(0, Math.atan2(moveDir.current.x, moveDir.current.z), 0);
      targetQuat.current.setFromEuler(tmpEuler.current);

      const rot = rb.rotation();
      const curQ = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
      curQ.slerp(targetQuat.current, 1 - Math.pow(0.0001, delta)); // slerp doux
      rb.setRotation(curQ, true);
    }
  });

  // Ajuste l’offset/échelle du modèle si nécessaire
  useEffect(() => {
    // scene.position.set(0, -0.9, 0);
    // scene.scale.setScalar(1);
  }, [scene]);

  return (
    <RigidBody
      ref={rbRef}
      colliders={false}
      mass={70}
      linearDamping={4}
      angularDamping={8}
      lockRotations
      {...props}
    >
      {/* Group visuel : c’est ce ref qu’on expose à l’extérieur */}
      <group ref={visualRef}>
        <CapsuleCollider
          args={[0.9, 0.35]}      // halfHeight, radius => hauteur totale ≈ 2.5m
          position={[0, 1.25, 0]} // centre de la capsule au "nombril"
        />
        <primitive object={scene} />
      </group>
    </RigidBody>
  );
});

export default Character;
