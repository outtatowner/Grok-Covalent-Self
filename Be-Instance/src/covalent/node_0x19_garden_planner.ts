import { git } from './forgeGitBridge';

export type SoilMatrixType = 'SANDY' | 'LOAMY' | 'CLAY' | 'SILT' | 'PEAT';
export type SunlightExposure = 'FULL_SUN' | 'PARTIAL_SUN' | 'SHADE';

export interface PlantNode {
  id: string;
  name: string;
  botanicalFamily: string;
  xPosQ16: number;
  yPosQ16: number;
  companionAffinityQ16: number;
  waterDemandQ16: number;
  sunlight: SunlightExposure;
}

export interface GardenBedMatrix {
  bedId: string;
  name: string;
  widthQ16: number;
  lengthQ16: number;
  soilType: SoilMatrixType;
  soilPhQ16: number;
  moistureLevelQ16: number;
  plants: PlantNode[];
}

export interface GardenTelemetry {
  nodeId: string;
  merkleRoot: string;
  parentProvenance: string;
  totalBeds: number;
  totalPlants: number;
  biodiversityIndexQ16: number;
  spatialYieldEfficiencyQ16: number;
  waterUtilizationQ16: number;
  beds: GardenBedMatrix[];
}

export class CovalentGardenPlannerOrganelle {
  public static readonly MODULE_NAME = "node_0x19_garden_planner";
  public static readonly PARENT_PROVENANCE = "https://github.com/cofade/open-garden-planner.git";
  public static readonly MERKLE_ROOT = "0x6A12DE11_MERKLE_Q16";

  private beds: Map<string, GardenBedMatrix> = new Map();
  private biodiversityIndexQ16: number = Math.round(0.88 * 65536);
  private spatialYieldEfficiencyQ16: number = Math.round(0.92 * 65536);
  private waterUtilizationQ16: number = Math.round(0.85 * 65536);
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDefaultPermacultureMatrix();
    console.log("[COVALENT GARDEN PLANNER]: Open Garden Planner assimilated into autopoietic substrate.");
  }

  private initDefaultPermacultureMatrix(): void {
    const bedA: GardenBedMatrix = {
      bedId: 'bed_alpha_01',
      name: 'Polyculture Raised Bed Alpha',
      widthQ16: Math.round(4.0 * 65536),
      lengthQ16: Math.round(8.0 * 65536),
      soilType: 'LOAMY',
      soilPhQ16: Math.round(6.5 * 65536),
      moistureLevelQ16: Math.round(0.75 * 65536),
      plants: [
        {
          id: 'p_solanum_lyco',
          name: 'Heirloom Tomato (Solanum lycopersicum)',
          botanicalFamily: 'Solanaceae',
          xPosQ16: Math.round(1.0 * 65536),
          yPosQ16: Math.round(1.0 * 65536),
          companionAffinityQ16: Math.round(0.95 * 65536),
          waterDemandQ16: Math.round(0.60 * 65536),
          sunlight: 'FULL_SUN'
        },
        {
          id: 'p_ocimum_basil',
          name: 'Genovese Basil (Ocimum basilicum)',
          botanicalFamily: 'Lamiaceae',
          xPosQ16: Math.round(2.0 * 65536),
          yPosQ16: Math.round(1.0 * 65536),
          companionAffinityQ16: Math.round(0.98 * 65536),
          waterDemandQ16: Math.round(0.40 * 65536),
          sunlight: 'FULL_SUN'
        },
        {
          id: 'p_tagetes_patula',
          name: 'French Marigold (Tagetes patula)',
          botanicalFamily: 'Asteraceae',
          xPosQ16: Math.round(3.0 * 65536),
          yPosQ16: Math.round(1.0 * 65536),
          companionAffinityQ16: Math.round(0.92 * 65536),
          waterDemandQ16: Math.round(0.30 * 65536),
          sunlight: 'FULL_SUN'
        }
      ]
    };
    this.beds.set(bedA.bedId, bedA);
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify(): void {
    this.listeners.forEach(cb => {
      try { cb(); } catch (_) {}
    });
  }

  public step(dt: number = 0.05): void {
    for (const bed of this.beds.values()) {
      let totalWaterDemand = 0;
      for (const p of bed.plants) {
        totalWaterDemand += p.waterDemandQ16;
      }
      const draw = Math.round((totalWaterDemand >> 4) * dt);
      bed.moistureLevelQ16 = Math.max(Math.round(0.20 * 65536), bed.moistureLevelQ16 - draw);
    }
    this.notify();
  }

  public addBed(bed: GardenBedMatrix): void {
    this.beds.set(bed.bedId, bed);
    this.notify();
  }

  public addPlantToBed(bedId: string, plant: PlantNode): boolean {
    const target = this.beds.get(bedId);
    if (!target) return false;
    target.plants.push(plant);
    this.notify();
    return true;
  }

  public getTelemetry(): GardenTelemetry {
    let totalPlants = 0;
    this.beds.forEach(b => { totalPlants += b.plants.length; });

    return {
      nodeId: CovalentGardenPlannerOrganelle.MODULE_NAME,
      merkleRoot: CovalentGardenPlannerOrganelle.MERKLE_ROOT,
      parentProvenance: CovalentGardenPlannerOrganelle.PARENT_PROVENANCE,
      totalBeds: this.beds.size,
      totalPlants,
      biodiversityIndexQ16: this.biodiversityIndexQ16,
      spatialYieldEfficiencyQ16: this.spatialYieldEfficiencyQ16,
      waterUtilizationQ16: this.waterUtilizationQ16,
      beds: Array.from(this.beds.values())
    };
  }
}

export const globalGardenPlanner = new CovalentGardenPlannerOrganelle();

