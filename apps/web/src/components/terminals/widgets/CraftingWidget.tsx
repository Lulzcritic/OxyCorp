import { useEffect, useState, useCallback, useMemo } from 'react';
import { apiFetch } from '../../../lib/api';
import GrimdarkCard from '../../grimdark/GrimdarkCard';
import GrimdarkButton from '../../grimdark/GrimdarkButton';
import GrimdarkProgressBar from '../../grimdark/GrimdarkProgressBar';
import '../../../styles/grimdark-theme.css';

interface CraftingJob {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  durationSeconds: number;
  rewardItemId: string;
  data?: {
    recipeId: string;
    batches: number;
    outputPerBatch: number;
  };
}

interface CraftingRecipe {
  id: string;
  name: string;
  inputMaterials: Array<{ item: string; qty: number }>;
  outputItem: string;
  outputQty: number;
  durationSeconds: number;
  requiredSkill?: string;
  requiredBlueprintItemId?: string;
}

const RECIPES: CraftingRecipe[] = [
  {
    id: 'CRAFT_NEURAL_RIG_V1',
    name: 'Assemble Neural Rig V1',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 5 },
      { item: 'SILICA', qty: 10 },
    ],
    outputItem: 'NEURAL_RIG_V1',
    outputQty: 1,
    durationSeconds: 30,
  },
  {
    id: 'CRAFT_EXOSUIT_V1',
    name: 'Assemble Exosuit Mk I',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 15 },
      { item: 'COPPER', qty: 10 },
    ],
    outputItem: 'EXOSUIT_V1',
    outputQty: 1,
    durationSeconds: 45,
    requiredSkill: 'FORGE_DRONE_HP_1',
    requiredBlueprintItemId: 'HARD_DRIVE_EXOSUIT_V1',
  },
  {
    id: 'CRAFT_AUTO_CANNON_V1',
    name: 'Assemble Auto-Cannon V1',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 10 },
      { item: 'IRON', qty: 20 },
    ],
    outputItem: 'AUTO_CANNON_V1',
    outputQty: 1,
    durationSeconds: 40,
    requiredSkill: 'FORGE_DRONE_DMG_1',
    requiredBlueprintItemId: 'HARD_DRIVE_AUTO_CANNON_V1',
  },
  {
    id: 'CRAFT_MINING_LASER_V1',
    name: 'Assemble Mining Laser V1',
    inputMaterials: [
      { item: 'STEEL_PLATING', qty: 5 },
      { item: 'SILICA', qty: 20 },
      { item: 'COPPER', qty: 10 },
    ],
    outputItem: 'MINING_LASER_V1',
    outputQty: 1,
    durationSeconds: 35,
  },
];

const HARD_DRIVE_META: Record<string, { name: string; unlocksName: string }> = {
  HARD_DRIVE_EXOSUIT_V1: {
    name: 'Encrypted Hard Drive: Exosuit Mk I Blueprint',
    unlocksName: 'Assemble Exosuit Mk I',
  },
  HARD_DRIVE_AUTO_CANNON_V1: {
    name: 'Encrypted Hard Drive: Auto-Cannon V1 Blueprint',
    unlocksName: 'Assemble Auto-Cannon V1',
  },
};

export default function CraftingWidget() {
  const [activeTab, setActiveTab] = useState<'assembly' | 'decrypt'>('assembly');
  const [jobs, setJobs] = useState<CraftingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(RECIPES[0].id);
  const [quantity, setQuantity] = useState<number>(1);
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>([]);
  const [blueprints, setBlueprints] = useState<string[]>([]);
  const [decryptingItem, setDecryptingItem] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await apiFetch('/user/profile');
      if (res.ok) {
        const data = await res.json();
        const invMap: Record<string, number> = {};
        if (data.inventory) {
          data.inventory.forEach((inv: { item: string; quantity: string }) => {
            invMap[inv.item] = parseInt(inv.quantity) || 0;
          });
        }
        setInventory(invMap);
        setBlueprints(data.blueprints || []);
      }

      const skillsRes = await apiFetch('/skills/data');
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        const skillsList = (skillsData.unlockedSkills || []).map((s: { skillId: string }) => s.skillId);
        setUnlockedSkills(skillsList);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await apiFetch('/crafting/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
    fetchJobs();
  }, [fetchInventory, fetchJobs]);

  useEffect(() => {
    if (jobs.length === 0) return;

    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      jobs.forEach((job) => {
        if (job.status !== 'ACTIVE') return;
        const startTime = new Date(job.startedAt).getTime();
        const endTime = startTime + job.durationSeconds * 1000;
        const diff = Math.ceil((endTime - Date.now()) / 1000);
        newTimers[job.id] = diff > 0 ? diff : 0;
      });
      setTimers(newTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [jobs]);

  // Compute visible recipes based on skill & blueprint locks
  const visibleRecipes = useMemo(() => {
    return RECIPES.filter((recipe) => {
      if (!recipe.requiredSkill && !recipe.requiredBlueprintItemId) return true;
      if (recipe.requiredSkill && unlockedSkills.includes(recipe.requiredSkill)) return true;
      if (blueprints.includes(recipe.id)) return true;
      return false;
    });
  }, [unlockedSkills, blueprints]);

  // Handle selected recipe fallback if it is hidden
  useEffect(() => {
    if (visibleRecipes.length > 0 && !visibleRecipes.some((r) => r.id === selectedRecipeId)) {
      setSelectedRecipeId(visibleRecipes[0].id);
    }
  }, [visibleRecipes, selectedRecipeId]);

  // Compute hard drive list in inventory
  const hardDrives = useMemo(() => {
    return Object.entries(inventory)
      .filter(([item, qty]) => item.startsWith('HARD_DRIVE_') && qty > 0)
      .map(([item, qty]) => {
        const meta = HARD_DRIVE_META[item] || {
          name: `Unidentified Storage Device (${item})`,
          unlocksName: 'Unknown data files',
        };
        return {
          item,
          quantity: qty,
          ...meta,
        };
      });
  }, [inventory]);

  const startCrafting = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/crafting/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeId: selectedRecipeId, quantity }),
      });

      if (res.ok) {
        await fetchJobs();
        await fetchInventory();
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      } else {
        const err = await res.json();
        alert('Crafting failed: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const claimJob = async (jobId: string) => {
    try {
      const res = await apiFetch('/crafting/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        const result = await res.json();
        const xpMsg = result.xpAwarded ? ` | +${result.xpAwarded} XP` : '';
        const levelMsg = result.levelUp ? ` | 🎉 LEVEL UP! Now Lvl ${result.newLevel}` : '';
        alert(`Claimed: +${result.quantity} ${result.item}${xpMsg}${levelMsg}`);
        await fetchJobs();
        await fetchInventory();
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      } else {
        const err = await res.json();
        alert('Claim failed: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecrypt = async (itemId: string) => {
    setDecryptingItem(itemId);
    setLoading(true);
    try {
      const res = await apiFetch('/user/blueprints/decrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });

      if (res.ok) {
        alert('Decryption completed! New schematic data uploaded to Forge library.');
        await fetchInventory();
        setActiveTab('assembly');
      } else {
        const err = await res.json();
        alert('Decryption failed: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDecryptingItem(null);
      setLoading(false);
    }
  };

  const selectedRecipe = RECIPES.find((r) => r.id === selectedRecipeId) || RECIPES[0];

  if (loading && jobs.length === 0) {
    return (
      <GrimdarkCard title="FORGE SYSTEM" status="online">
        <div style={{ color: '#555', fontFamily: "var(--gd-font-primary, 'VT323', monospace)" }}>
          &gt; Calibrating Forge...
        </div>
      </GrimdarkCard>
    );
  }

  return (
    <GrimdarkCard title="FORGE ASSEMBLY" status="online">
      <div style={{ fontFamily: "var(--gd-font-primary, monospace)" }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveTab('assembly')}
            style={{
              background: activeTab === 'assembly' ? '#00FF9D' : 'transparent',
              color: activeTab === 'assembly' ? '#000' : '#888',
              border: `1px solid ${activeTab === 'assembly' ? '#00FF9D' : '#333'}`,
              padding: '6px 15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit',
            }}
          >
            ASSEMBLY LINE
          </button>
          <button
            onClick={() => setActiveTab('decrypt')}
            style={{
              background: activeTab === 'decrypt' ? '#FFD700' : 'transparent',
              color: activeTab === 'decrypt' ? '#000' : '#888',
              border: `1px solid ${activeTab === 'decrypt' ? '#FFD700' : '#333'}`,
              padding: '6px 15px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontFamily: 'inherit',
              position: 'relative',
            }}
          >
            DECRYPT STATION
            {hardDrives.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#FF3366',
                color: '#FFF',
                fontSize: '0.65rem',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}>
                {hardDrives.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Assembly Line */}
        {activeTab === 'assembly' && (
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            
            {/* Left: Recipe Selector */}
            <div style={{ flex: 1 }}>
              <label style={{ color: '#888', display: 'block', marginBottom: 6, fontSize: '0.9rem' }}>
                &gt; SELECT SCHEMATIC
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {visibleRecipes.map((r) => {
                  const isSelected = r.id === selectedRecipeId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRecipeId(r.id)}
                      style={{
                        background: isSelected ? '#1a221a' : '#0A0A0A',
                        color: isSelected ? '#00FF9D' : '#888',
                        border: `1px solid ${isSelected ? '#00FF9D' : '#333'}`,
                        padding: '10px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{r.name}</span>
                      <span style={{ fontSize: '0.85rem', color: '#555' }}>{r.durationSeconds}s</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Requirements & Start */}
            <div style={{ flex: 1, background: '#0E0E0E', border: '1px solid #2A2A2A', padding: '15px' }}>
              <h3 style={{ color: '#00F3FF', marginTop: 0, marginBottom: '15px', fontSize: '1.2rem' }}>
                ASSEMBLY DETAILS
              </h3>
              
              {/* Input list */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>REQUIRED MATERIALS:</div>
                {selectedRecipe.inputMaterials.map((mat) => {
                  const owned = inventory[mat.item] || 0;
                  const needed = mat.qty * quantity;
                  const hasSufficient = owned >= needed;
                  return (
                    <div
                      key={mat.item}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        borderBottom: '1px solid #1A1A1A',
                        color: hasSufficient ? '#AAA' : '#FF3366',
                      }}
                    >
                      <span>{mat.item}</span>
                      <span>
                        {owned} / {needed}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quantity Selector & Build Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#888' }}>QTY</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    background: '#050505',
                    color: '#FFF',
                    border: '1px solid #333',
                    padding: '6px',
                    width: '60px',
                    textAlign: 'center',
                    fontFamily: 'inherit',
                  }}
                />
                <GrimdarkButton
                  variant="warning"
                  onClick={startCrafting}
                  style={{ flex: 1, height: '36px' }}
                >
                  ENGAGE ASSEMBLY
                </GrimdarkButton>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Decrypt Station */}
        {activeTab === 'decrypt' && (
          <div style={{ minHeight: '200px', marginBottom: '20px' }}>
            <div style={{ color: '#888', marginBottom: '15px', fontSize: '0.9rem' }}>
              &gt; DETECTED ENCRYPTED STORAGE MEDIA
            </div>
            {hardDrives.length === 0 ? (
              <div style={{
                color: '#555',
                fontStyle: 'italic',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px dashed #333',
                background: '#050505'
              }}>
                NO STORAGE MEDIA DETECTED IN BUNKER INVENTORY.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {hardDrives.map((drive) => (
                  <div
                    key={drive.item}
                    style={{
                      background: '#0E0E0E',
                      border: '1px solid #FFD700',
                      padding: '15px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>
                        {drive.name}
                      </div>
                      <div style={{ color: '#888', fontSize: '0.85rem' }}>
                        Target Blueprint: {drive.unlocksName}
                      </div>
                      <div style={{ color: '#555', fontSize: '0.8rem', marginTop: '4px' }}>
                        INVENTORY BALANCE: {drive.quantity}
                      </div>
                    </div>
                    <GrimdarkButton
                      variant="warning"
                      onClick={() => handleDecrypt(drive.item)}
                      disabled={loading}
                      style={{ height: '36px', minWidth: '150px' }}
                    >
                      {decryptingItem === drive.item ? 'DECRYPTING...' : 'DECRYPT DATA'}
                    </GrimdarkButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Jobs (Queues render on both tabs to allow player tracking) */}
        {jobs.length > 0 && (
          <div style={{ borderTop: '1px solid #2A2A2A', paddingTop: '15px' }}>
            <div style={{ color: '#888', marginBottom: '10px', fontSize: '0.9rem' }}>
              &gt; MANUFACTURING QUEUE
            </div>
            {jobs.map((job) => {
              const timeLeft = timers[job.id] ?? 0;
              const isReady = timeLeft === 0 && job.status === 'ACTIVE';
              const batches = job.data?.batches || 1;
              const output = job.data?.outputPerBatch || 1;
              const progressPct = job.durationSeconds > 0
                ? Math.max(0, 100 - (timeLeft / job.durationSeconds) * 100)
                : 100;

              return (
                <div
                  key={job.id}
                  style={{
                    background: '#0E0E0E',
                    padding: '12px',
                    marginBottom: '8px',
                    border: isReady ? '1px solid #FFA500' : '1px solid #2A2A2A',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                      color: isReady ? '#FFA500' : '#00FF9D',
                      fontWeight: 'bold',
                    }}>
                      {job.rewardItemId} x{batches * output}
                    </span>
                    <span style={{ color: '#888', fontSize: '0.9rem' }}>
                      {isReady ? 'READY' : `${timeLeft}s`}
                    </span>
                  </div>

                  {!isReady && (
                    <GrimdarkProgressBar
                      value={progressPct}
                      variant="warning"
                      width={12}
                    />
                  )}

                  {isReady && (
                    <GrimdarkButton
                      variant="warning"
                      onClick={() => claimJob(job.id)}
                      style={{ width: '100%', marginTop: '6px' }}
                    >
                      COLLECT EQUIPMENT
                    </GrimdarkButton>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </GrimdarkCard>
  );
}
