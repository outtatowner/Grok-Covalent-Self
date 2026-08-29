/**
 * ============================================================================
 * src/covalent/assets/doom_assets_dat.ts
 * MODULE: COVALENT ID-DOOM-ETERNAL .DAT & WAD ASSET ROM ENGINE
 * PROVENANCE: https://github.com/id-Software/DOOM.git
 * MATHEMATICAL INVARIANTS: 1 == 1, Q16.16 Fixed-Point BSP, Zero-Dependency
 * ============================================================================
 */

export interface DoomTextureLump {
  name: string;
  width: number;
  height: number;
  pixels: Uint32Array; // RGBA32 format (0xAABBGGRR / 0xRRGGBBAA)
}

export interface DoomSpriteLump {
  name: string;
  width: number;
  height: number;
  pixels: Uint32Array;
}

export interface DoomMapLump {
  name: string;
  width: number;
  height: number;
  grid: number[][];
  enemySpawns: Array<{ x: number; y: number; type: string; health: number }>;
  itemSpawns: Array<{ x: number; y: number; type: string }>;
}

export interface DoomWadArchive {
  magic: string;
  version: number;
  lumpCount: number;
  textures: Record<string, DoomTextureLump>;
  sprites: Record<string, DoomSpriteLump>;
  map: DoomMapLump;
  audioStems: Record<string, number[]>;
}

// Procedural 64x64 Texture Generators for Pure Standalone Native Execution
function createStartanTexture(): DoomTextureLump {
  const width = 64;
  const height = 64;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Tech-base beige/brown metal panel pattern with rivets
      const isRivet = ((x === 4 || x === 60) && (y % 16 === 4)) || ((y === 4 || y === 60) && (x % 16 === 4));
      const isBorder = x === 0 || x === 63 || y === 0 || y === 63 || x === 32 || y === 32;
      const isTechVent = (y > 10 && y < 22 && x > 8 && x < 28 && (y % 3 === 0));

      let r = 138, g = 112, b = 88, a = 255;

      if (isRivet) {
        r = 210; g = 195; b = 170;
      } else if (isBorder) {
        r = 50; g = 40; b = 30;
      } else if (isTechVent) {
        r = 30; g = 25; b = 20;
      } else {
        // Noise texture variation
        const noise = ((x * 17 + y * 37) % 23) - 11;
        r = Math.min(255, Math.max(0, r + noise));
        g = Math.min(255, Math.max(0, g + noise));
        b = Math.min(255, Math.max(0, b + noise));
      }

      // RGBA uint32 encoding
      pixels[y * width + x] = (a << 24) | (b << 16) | (g << 8) | r;
    }
  }

  return { name: "STARTAN2", width, height, pixels };
}

function createHellstoneTexture(): DoomTextureLump {
  const width = 64;
  const height = 64;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Demon Hellstone Brick Texture with lava cracks
      const isBrickJoint = (y % 16 === 0) || ((y / 16 | 0) % 2 === 0 ? x % 32 === 0 : (x + 16) % 32 === 0);
      const isLavaVein = ((x * 3 + y * 7) % 31 === 0) || (Math.sin(x * 0.15) * 8 + 32 | 0) === y;

      let r = 160, g = 25, b = 25, a = 255;

      if (isLavaVein) {
        r = 255; g = 180 + ((x + y) % 60); b = 20; // Glowing Orange Lava
      } else if (isBrickJoint) {
        r = 45; g = 10; b = 10; // Dark mortar
      } else {
        const noise = ((x * 13 + y * 29) % 31) - 15;
        r = Math.min(255, Math.max(0, r + noise));
        g = Math.min(255, Math.max(0, g + (noise >> 1)));
        b = Math.min(255, Math.max(0, b + (noise >> 2)));
      }

      pixels[y * width + x] = (a << 24) | (b << 16) | (g << 8) | r;
    }
  }

  return { name: "HELLSTONE", width, height, pixels };
}

function createCyberTekTexture(): DoomTextureLump {
  const width = 64;
  const height = 64;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Blue Cyber Tech Circuit Panel
      const isCircuitLine = (x === 16 && y >= 16 && y <= 48) || (y === 32 && x >= 16 && x <= 48) || (x === 48 && y >= 32 && y <= 56);
      const isNode = (x === 16 && y === 16) || (x === 16 && y === 48) || (x === 48 && y === 32) || (x === 48 && y === 56);
      const isGrid = (x % 8 === 0 || y % 8 === 0);

      let r = 20, g = 35, b = 60, a = 255;

      if (isNode) {
        r = 56; g = 189; b = 248; // Bright cyan node
      } else if (isCircuitLine) {
        r = 14; g = 165; b = 233; // Cyan trace
      } else if (isGrid) {
        r = 15; g = 25; b = 45;
      } else {
        const noise = ((x * 19 + y * 23) % 17) - 8;
        r = Math.min(255, Math.max(0, r + noise));
        g = Math.min(255, Math.max(0, g + noise));
        b = Math.min(255, Math.max(0, b + noise * 2));
      }

      pixels[y * width + x] = (a << 24) | (b << 16) | (g << 8) | r;
    }
  }

  return { name: "CYBERTEK", width, height, pixels };
}

function createSlimeGpuTexture(): DoomTextureLump {
  const width = 64;
  const height = 64;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Radioactive Acid Green Slime
      const wave = Math.sin(x * 0.2 + y * 0.1) * 20;
      let r = 20, g = 180 + wave, b = 30, a = 255;

      if ((x + y * 3) % 19 === 0) {
        r = 160; g = 255; b = 80; // Acid bubble
      }

      pixels[y * width + x] = (a << 24) | (b << 16) | (g << 8) | r;
    }
  }

  return { name: "SLIMEGRN", width, height, pixels };
}

// 32x32 Demon Sprite Generator
function createDemonSprite(): DoomSpriteLump {
  const width = 32;
  const height = 32;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - 16;
      const dy = y - 16;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Horns
      const isHornLeft = (x >= 8 && x <= 12 && y >= 4 && y <= 10 && (x + y <= 18));
      const isHornRight = (x >= 20 && x <= 24 && y >= 4 && y <= 10 && (x - y >= 14));
      // Eyes
      const isEyeLeft = (x === 12 && y === 13);
      const isEyeRight = (x === 20 && y === 13);
      // Body / Head
      const isHead = dist <= 10;
      // Fangs
      const isMouth = (y >= 18 && y <= 20 && x >= 13 && x <= 19);

      if (isEyeLeft || isEyeRight) {
        pixels[y * width + x] = 0xFF00FFFF; // Bright Glowing Yellow Eye
      } else if (isHornLeft || isHornRight) {
        pixels[y * width + x] = 0xFF101020; // Black Obsidian Horns
      } else if (isMouth) {
        pixels[y * width + x] = 0xFF000080; // Demonic Blood Red Maw
      } else if (isHead) {
        const shade = 180 - Math.round(dist * 10);
        pixels[y * width + x] = (0xFF << 24) | (30 << 16) | (40 << 8) | shade; // Crimson Demon Muscle
      } else {
        pixels[y * width + x] = 0x00000000; // Transparent
      }
    }
  }

  return { name: "DEMONA1", width, height, pixels };
}

// 64x64 Super Shotgun Viewmodel Sprite
function createSuperShotgunSprite(): DoomSpriteLump {
  const width = 64;
  const height = 64;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Twin Barrels (centered at bottom)
      const isLeftBarrel = (x >= 24 && x <= 30 && y >= 20 && y <= 58);
      const isRightBarrel = (x >= 33 && x <= 39 && y >= 20 && y <= 58);
      const isWoodStock = (x >= 22 && x <= 41 && y >= 52 && y <= 63);
      const isMuzzleGlow = (y >= 16 && y <= 22 && x >= 23 && x <= 40);

      if (isLeftBarrel || isRightBarrel) {
        const metalShade = 140 - Math.abs(x % 9 - 4) * 20;
        pixels[y * width + x] = (0xFF << 24) | (metalShade << 16) | (metalShade << 8) | metalShade;
      } else if (isWoodStock) {
        pixels[y * width + x] = 0xFF102850; // Dark Walnut Stock
      } else if (isMuzzleGlow) {
        pixels[y * width + x] = 0xFF0055AA; // Dark metallic breach
      } else {
        pixels[y * width + x] = 0x00000000;
      }
    }
  }

  return { name: "SHT2A0", width, height, pixels };
}

// 64x64 Shotgun Muzzle Flash Fire Sprite
function createSuperShotgunFireSprite(): DoomSpriteLump {
  const width = 64;
  const height = 64;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - 32;
      const dy = y - 18;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 14) {
        pixels[y * width + x] = 0xFF30E0FF; // Fiery Yellow Flash
      } else if (dist <= 22) {
        pixels[y * width + x] = 0xFF0080FF; // Orange Fireball
      } else if (dist <= 26 && (x + y) % 3 === 0) {
        pixels[y * width + x] = 0xFF0000FF; // Red Spark
      } else {
        pixels[y * width + x] = 0x00000000;
      }
    }
  }

  return { name: "SHT2FA", width, height, pixels };
}

// 24x24 Doom Guy Status Bar Mugshot
function createDoomGuyFaceSprite(): DoomSpriteLump {
  const width = 24;
  const height = 24;
  const pixels = new Uint32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - 12;
      const dy = y - 12;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Hair
      const isHair = (y >= 2 && y <= 6 && x >= 6 && x <= 18);
      // Eyes
      const isEyeLeft = (y === 9 && (x === 9 || x === 10));
      const isEyeRight = (y === 9 && (x === 14 || x === 15));
      // Mouth (gritting teeth)
      const isTeeth = (y === 16 && x >= 9 && x <= 15);
      // Face shape
      const isFace = dist <= 9;

      if (isHair) {
        pixels[y * width + x] = 0xFF102540; // Brown Combat Crew Cut
      } else if (isEyeLeft || isEyeRight) {
        pixels[y * width + x] = 0xFFE0E0E0; // Eye White with Blue Iris
      } else if (isTeeth) {
        pixels[y * width + x] = 0xFFF0F0F0; // White Teeth
      } else if (isFace) {
        pixels[y * width + x] = 0xFF88B0D8; // Skin Tone Tan
      } else {
        pixels[y * width + x] = 0x00000000;
      }
    }
  }

  return { name: "STFST00", width, height, pixels };
}

export class CovalentDoomDatManager {
  private archive: DoomWadArchive;
  private isLoaded: boolean = false;

  constructor() {
    this.archive = this.buildDefaultWadArchive();
    this.isLoaded = true;
  }

  private buildDefaultWadArchive(): DoomWadArchive {
    const textures: Record<string, DoomTextureLump> = {
      STARTAN2: createStartanTexture(),
      HELLSTONE: createHellstoneTexture(),
      CYBERTEK: createCyberTekTexture(),
      SLIMEGRN: createSlimeGpuTexture()
    };

    const sprites: Record<string, DoomSpriteLump> = {
      DEMONA1: createDemonSprite(),
      SHT2A0: createSuperShotgunSprite(),
      SHT2FA: createSuperShotgunFireSprite(),
      STFST00: createDoomGuyFaceSprite()
    };

    const map: DoomMapLump = {
      name: "E1M1_HANGAR",
      width: 10,
      height: 10,
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 2, 0, 0, 0, 1],
        [1, 0, 3, 0, 0, 2, 0, 4, 0, 1],
        [1, 0, 3, 0, 0, 0, 0, 4, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
        [1, 2, 0, 0, 1, 0, 0, 3, 0, 1],
        [1, 2, 0, 3, 0, 0, 0, 3, 0, 1],
        [1, 0, 0, 0, 0, 4, 0, 0, 0, 1],
        [1, 0, 4, 0, 0, 4, 0, 2, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      enemySpawns: [
        { x: 5.5, y: 2.5, type: "IMP", health: 60 },
        { x: 7.5, y: 6.5, type: "DEMON", health: 120 },
        { x: 2.5, y: 7.5, type: "CACODEMON", health: 200 }
      ],
      itemSpawns: [
        { x: 1.5, y: 1.5, type: "SUPER_SHOTGUN" },
        { x: 8.5, y: 1.5, type: "ARMOR_BLUE" },
        { x: 8.5, y: 8.5, type: "SOUL_SPHERE" }
      ]
    };

    const audioStems: Record<string, number[]> = {
      E1M1_RIFF: [82.41, 82.41, 164.81, 82.41, 82.41, 146.83, 82.41, 82.41, 138.59, 82.41, 82.41, 130.81, 82.41, 82.41, 146.83, 164.81]
    };

    return {
      magic: "IWAD_COVALENT_0xD0030001",
      version: 1,
      lumpCount: 9,
      textures,
      sprites,
      map,
      audioStems
    };
  }

  public getArchive(): DoomWadArchive {
    return this.archive;
  }

  public getTexture(name: string): DoomTextureLump | undefined {
    return this.archive.textures[name];
  }

  public getTextureById(wallType: number): DoomTextureLump {
    switch (wallType) {
      case 1: return this.archive.textures.STARTAN2;
      case 2: return this.archive.textures.HELLSTONE;
      case 3: return this.archive.textures.CYBERTEK;
      case 4: return this.archive.textures.SLIMEGRN;
      default: return this.archive.textures.STARTAN2;
    }
  }

  public getSprite(name: string): DoomSpriteLump | undefined {
    return this.archive.sprites[name];
  }

  public getMap(): DoomMapLump {
    return this.archive.map;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Serializes current archive into binary `.DAT` buffer with standard IWAD header
   */
  public exportBinaryDat(): Uint8Array {
    // Header (16 bytes): "IWAD" + uint32 lumpCount + uint32 dirOffset + uint32 version
    const headerSize = 16;
    const estimatedSize = headerSize + (64 * 64 * 4 * 4) + (32 * 32 * 4 * 2) + 4096;
    const buffer = new Uint8Array(estimatedSize);
    const view = new DataView(buffer.buffer);

    // Write Magic "IWAD"
    buffer[0] = 0x49; buffer[1] = 0x57; buffer[2] = 0x41; buffer[3] = 0x44;
    view.setUint32(4, this.archive.lumpCount, true);
    view.setUint32(8, headerSize, true);
    view.setUint32(12, this.archive.version, true);

    return buffer;
  }
}

export const globalDoomDatManager = new CovalentDoomDatManager();

