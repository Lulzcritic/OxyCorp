import SeededMiningTerrain from './SeededMiningTerrain';
import RockSpawns from './RockSpawns';

export default function MiningParcel({ seed, onReturn }: { seed: string; onReturn: () => void }) {
  return (
    <>
      <SeededMiningTerrain seed={seed} />
      <RockSpawns seed={seed} />
    </>
  );
}