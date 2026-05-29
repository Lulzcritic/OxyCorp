/**
 * Martian Lighting Component
 * 
 * Shared lighting setup for outside environments (HQ, Plots).
 * Provides reddish ambient light and harsh, low-angle directional sun with shadows.
 */

export default function MartianLighting() {
  return (
    <>
      {/* Reddish ambient light for Mars atmosphere */}
      <ambientLight intensity={0.2} color="#ffaa88" />

      {/* Harsh, low-angle directional sun */}
      <directionalLight
        position={[50, 20, -50]}
        intensity={1.5}
        color="#ffeedd"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={150}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
    </>
  );
}
