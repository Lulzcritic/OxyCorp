import MiningTerrain from './SeededMiningTerrain';
import RockSpawns from './RockSpawns';

export default function MiningParcel({ seed, onReturn }: { seed: string; onReturn: () => void }) {
  return (
    <>
          <MiningTerrain seedMining={seed} />
        <RockSpawns seed={seed} />
    </>
  );
}