

export function ExplorationZone({ seed, onReturn }: { seed: string; onReturn: () => void }) {
  return (
    <>
      <SeededMiningTerrain seed={seed} />
      <RockSpawns seed={seed} />
      <LightingSetup />
      <button
        style={{ position: 'absolute', top: 20, right: 20 }}
        onClick={onReturn}
      >
        Revenir à la base
      </button>
    </>
  );
}