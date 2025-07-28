import { useState } from 'react';

export function MineableRock({ id, position }: { id: string; position: [number, number, number] }) {
  const [mined, setMined] = useState(false);

  const handleMine = async () => {
    if (mined) return;

    setMined(true); // feedback immédiat

    /*const { error } = await supabase.functions.invoke('mineRock', {
      body: { rockId: id },
    });

    if (error) {
      console.error(error);
      setMined(false); // rollback si erreur
    }*/
  };

  return (
    <mesh
      position={position}
      onClick={handleMine}
      scale={mined ? [0.01, 0.01, 0.01] : [1, 1, 1]}
    >
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={mined ? 'gray' : 'brown'} />
    </mesh>
  );
}
