/**
 * Player Controller Component
 * 
 * Third-person player controls with WASD movement, mouse orbit camera,
 * animated character model, raycasting for terminal detection, and E key interaction.
 * Uses dynamic rigid body for wall collisions and camera raycasting to prevent clipping.
 */

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { Vector3, Quaternion, Euler, Raycaster } from 'three';
import * as THREE from 'three';
import { useInteractionStore } from '../../services/InteractionStore';
import { useTerminalStore } from '../../services/TerminalManager';
import { useEditorStore } from '../../services/EditorStore';
import { TerminalType } from '../../types/terminal';
import PlayerModel from './PlayerModel';

const MOVE_SPEED = 5;
const INTERACTION_DISTANCE = 4;
const CAMERA_COLLISION_OFFSET = 0.3; // How far in front of wall the camera sits

// Audio feedback
function playBeep(frequency: number, duration: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.value = frequency;
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors
  }
}

interface PlayerControllerProps {
  spawnPosition?: [number, number, number];
  onMove?: (posX: number, posY: number, posZ: number, rotY: number) => void;
}

export default function PlayerController({
  spawnPosition = [-6.23, 3, -39.39],
  onMove,
}: PlayerControllerProps = {}) {
  const rigidBodyRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const playerModelRef = useRef<THREE.Group>(null);
  const { scene, camera } = useThree();
  const isMovingRef = useRef(false);
  const cameraRaycaster = useRef(new Raycaster());
  const lastPlayerPos = useRef(new Vector3(spawnPosition[0], spawnPosition[1], spawnPosition[2]));

  const movementLocked = useInteractionStore((s) => s.movementLocked);
  const setMovementLocked = useInteractionStore((s) => s.setMovementLocked);
  const openTerminal = useTerminalStore((s) => s.openTerminal);
  const isTerminalOpen = useTerminalStore((s) => s.isOpen);
  const isEditorMode = useEditorStore((s) => s.isEditorMode);
  const setPlayerCoords = useEditorStore((s) => s.setPlayerCoords);

  // Track keyboard input
  const keysPressed = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Keyboard event handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          keysPressed.current.forward = true;
          break;
        case 'KeyS':
          keysPressed.current.backward = true;
          break;
        case 'KeyA':
          keysPressed.current.left = true;
          break;
        case 'KeyD':
          keysPressed.current.right = true;
          break;
        case 'KeyE':
          handleInteraction();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
          keysPressed.current.forward = false;
          break;
        case 'KeyS':
          keysPressed.current.backward = false;
          break;
        case 'KeyA':
          keysPressed.current.left = false;
          break;
        case 'KeyD':
          keysPressed.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Handle E key interaction
  const handleInteraction = () => {
    const state = useInteractionStore.getState();
    if (state.hoveredTerminal && state.inRange) {
      playBeep(800, 0.15);
      setTimeout(() => playBeep(1200, 0.1), 100);
      
      if (state.onInteract) {
        // Execute custom interaction (e.g. scene transition)
        state.onInteract();
      } else {
        // Default terminal open
        openTerminal(state.hoveredTerminal as TerminalType);
        setMovementLocked(true);
      }
    }
  };

  // Watch for terminal close to re-enable movement
  useEffect(() => {
    if (!isTerminalOpen && movementLocked) {
      playBeep(400, 0.1);
      setMovementLocked(false);
    }
  }, [isTerminalOpen, movementLocked, setMovementLocked]);

  useFrame((_state, delta) => {
    // In editor mode, just update coordinates for the overlay
    if (isEditorMode) {
      if (rigidBodyRef.current) {
        const pos = rigidBodyRef.current.translation();
        setPlayerCoords([
          Number(pos.x.toFixed(2)),
          Number(pos.y.toFixed(2)),
          Number(pos.z.toFixed(2)),
        ]);
      }
      return;
    }

    if (!rigidBodyRef.current) return;
    const currentPos = rigidBodyRef.current.translation();
    const playerPos = new Vector3(currentPos.x, currentPos.y, currentPos.z);

    // --- Proximity-based terminal detection (third-person friendly) ---
    const setHoveredState = useInteractionStore.getState().setHovered;
    let closestType: string | null = null;
    let closestLabel: string | null = null;
    let closestCallback: (() => void) | undefined = undefined;
    let closestDist = INTERACTION_DISTANCE;

    scene.traverse((obj) => {
      if (obj.userData?.isTerminal) {
        const terminalWorldPos = new Vector3();
        obj.getWorldPosition(terminalWorldPos);
        const dist = playerPos.distanceTo(terminalWorldPos);
        if (dist < closestDist) {
          closestDist = dist;
          closestType = obj.userData.terminalType;
          closestLabel = obj.userData.label;
          closestCallback = obj.userData.onInteract;
        }
      }
    });

    if (closestType && closestLabel) {
      setHoveredState(closestType, closestLabel, true, closestCallback);
    } else {
      setHoveredState(null, null, false, undefined);
    }

    // --- Movement ---
    if (movementLocked) {
      isMovingRef.current = false;
      // Stop horizontal velocity but maintain gravity
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true);
      return;
    }

    // Get camera-relative forward/right directions (flattened to XZ plane)
    const cameraForward = new Vector3();
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();

    const cameraRight = new Vector3();
    cameraRight.crossVectors(cameraForward, new Vector3(0, 1, 0)).normalize();

    const moveDirection = new Vector3(0, 0, 0);

    if (keysPressed.current.forward) {
      moveDirection.add(cameraForward);
    }
    if (keysPressed.current.backward) {
      moveDirection.sub(cameraForward);
    }
    if (keysPressed.current.left) {
      moveDirection.sub(cameraRight);
    }
    if (keysPressed.current.right) {
      moveDirection.add(cameraRight);
    }

    const moving = moveDirection.lengthSq() > 0;
    isMovingRef.current = moving;

    if (moving) {
      moveDirection.normalize();

      // Set velocity on the dynamic body — Rapier handles wall collisions
      // Preserve Y velocity (gravity) so the player can fall/land
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel(
        {
          x: moveDirection.x * MOVE_SPEED,
          y: currentVel.y,
          z: moveDirection.z * MOVE_SPEED,
        },
        true
      );

      // Rotate character to face movement direction
      if (playerModelRef.current) {
        const targetAngle = Math.atan2(moveDirection.x, moveDirection.z);
        const targetQuat = new Quaternion().setFromEuler(
          new Euler(0, targetAngle, 0)
        );
        playerModelRef.current.quaternion.slerp(targetQuat, 10 * delta);
      }
    } else {
      // Not moving — stop horizontal velocity, preserve Y for gravity
      const currentVel = rigidBodyRef.current.linvel();
      rigidBodyRef.current.setLinvel({ x: 0, y: currentVel.y, z: 0 }, true);
    }

    // Sync model group position with physics body
    // Offset Y down by capsule half-extent (half-height 0.5 + radius 0.5 = 1.0) so model stands on floor
    const updatedTranslation = rigidBodyRef.current.translation();
    if (playerModelRef.current) {
      playerModelRef.current.position.set(
        updatedTranslation.x,
        updatedTranslation.y - 1.0,
        updatedTranslation.z
      );
    }

    // Move camera + orbit target with the player delta (keeps orbit distance consistent)
    const updatedPos = new Vector3(updatedTranslation.x, updatedTranslation.y, updatedTranslation.z);
    const playerDelta = updatedPos.clone().sub(lastPlayerPos.current);
    lastPlayerPos.current.copy(updatedPos);

    if (onMove && (playerDelta.lengthSq() > 0.00001 || keysPressed.current.forward || keysPressed.current.backward || keysPressed.current.left || keysPressed.current.right)) {
      const rotY = playerModelRef.current ? playerModelRef.current.rotation.y : 0;
      onMove(updatedTranslation.x, updatedTranslation.y - 1.0, updatedTranslation.z, rotY);
    }

    if (controlsRef.current) {
      if (playerDelta.lengthSq() > 0.00001) {
        camera.position.add(playerDelta);
      }
      controlsRef.current.target.set(
        updatedTranslation.x,
        updatedTranslation.y + 0.5,
        updatedTranslation.z
      );
    }

    // --- Camera wall collision ---
    // Raycast from player to desired camera position
    const playerHead = new Vector3(
      updatedTranslation.x,
      updatedTranslation.y + 1.5,
      updatedTranslation.z
    );
    const camPos = camera.position.clone();
    const dirToCamera = camPos.clone().sub(playerHead);
    const distToCamera = dirToCamera.length();

    if (distToCamera > 0.1) {
      dirToCamera.normalize();
      cameraRaycaster.current.set(playerHead, dirToCamera);
      cameraRaycaster.current.far = distToCamera;

      // Only check scene meshes (not UI/helpers/player)
      const intersects = cameraRaycaster.current.intersectObjects(
        scene.children,
        true
      ).filter((hit) => {
        // Skip player model and non-mesh objects
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj === playerModelRef.current) return false;
          if (obj.userData?.isTerminal) return false;
          obj = obj.parent;
        }
        return true;
      });

      if (intersects.length > 0) {
        const hitPoint = intersects[0].point;
        // Move camera to just in front of the wall
        const safePos = hitPoint.clone().sub(
          dirToCamera.clone().multiplyScalar(CAMERA_COLLISION_OFFSET)
        );
        camera.position.copy(safePos);
      }
    }
  });

  return (
    <>
      {/* Camera controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.25}
          enablePan={false}
          enableZoom={true}
          minDistance={2}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={0.3}
          mouseButtons={{
            LEFT: undefined as any,
            MIDDLE: 2,   // Middle-click to dolly
            RIGHT: 0,    // Right-click to rotate (WoW-style)
          }}
        />

      {/* Physics body — dynamic so it collides with bunker walls */}
      <RigidBody
        ref={rigidBodyRef}
        position={spawnPosition}
        enabledRotations={[false, false, false]}
        type="dynamic"
        mass={1}
        lockTranslations={false}
        gravityScale={1}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
      </RigidBody>

      {/* Player character model */}
      <group ref={playerModelRef}>
        <PlayerModel movingRef={isMovingRef} />
      </group>
    </>
  );
}

