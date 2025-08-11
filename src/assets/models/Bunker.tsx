import { useGLTF } from '@react-three/drei';

export default function Bunker({ position = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/bunker.glb');
  return <primitive object={scene} position={position} scale={0.4} castShadow />;
}
