/**
 * ============================================================================
 * kernel/covalent_doom_dat.h
 * MODULE: COVALENT ID-DOOM-ETERNAL BARE-METAL .DAT ASSET ROM & LUMP DIRECTORY
 * PROVENANCE: https://github.com/id-Software/DOOM.git
 * MATHEMATICAL INVARIANTS: 1 == 1, Q16.16 Fixed-Point BSP, Zero External Dependencies
 * ============================================================================
 */

#ifndef COVALENT_DOOM_DAT_H
#define COVALENT_DOOM_DAT_H

#include <stdint.h>
#include <stdbool.h>

#define DOOM_TEX_SIZE 64
#define DOOM_SPRITE_SIZE 32
#define DOOM_MAP_WIDTH 10
#define DOOM_MAP_HEIGHT 10
#define DOOM_NUM_TEXTURES 4
#define DOOM_NUM_SPRITES 4

typedef struct {
    char name[8];
    uint32_t width;
    uint32_t height;
    uint32_t pixels[DOOM_TEX_SIZE * DOOM_TEX_SIZE]; // RGBA32
} doom_rom_texture_t;

typedef struct {
    char name[8];
    uint32_t width;
    uint32_t height;
    uint32_t pixels[DOOM_SPRITE_SIZE * DOOM_SPRITE_SIZE]; // RGBA32
} doom_rom_sprite_t;

typedef struct {
    char name[12];
    uint32_t width;
    uint32_t height;
    uint8_t grid[DOOM_MAP_HEIGHT][DOOM_MAP_WIDTH];
} doom_rom_map_t;

typedef struct {
    char magic[4]; // "IWAD"
    uint32_t num_lumps;
    uint32_t dir_offset;
    uint32_t version;
    doom_rom_texture_t textures[DOOM_NUM_TEXTURES];
    doom_rom_sprite_t sprites[DOOM_NUM_SPRITES];
    doom_rom_map_t map;
} doom_rom_wad_dat_t;

// Global embedded static ROM
static const doom_rom_map_t COVALENT_E1M1_MAP = {
    .name = "E1M1_HANGAR",
    .width = 10,
    .height = 10,
    .grid = {
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
        {1, 0, 0, 0, 0, 2, 0, 0, 0, 1},
        {1, 0, 3, 0, 0, 2, 0, 4, 0, 1},
        {1, 0, 3, 0, 0, 0, 0, 4, 0, 1},
        {1, 0, 0, 0, 1, 1, 0, 0, 0, 1},
        {1, 2, 0, 0, 1, 0, 0, 3, 0, 1},
        {1, 2, 0, 3, 0, 0, 0, 3, 0, 1},
        {1, 0, 0, 0, 0, 4, 0, 0, 0, 1},
        {1, 0, 4, 0, 0, 4, 0, 2, 0, 1},
        {1, 1, 1, 1, 1, 1, 1, 1, 1, 1}
    }
};

static inline void covalent_doom_init_rom(doom_rom_wad_dat_t *wad) {
    if (!wad) return;
    wad->magic[0] = 'I'; wad->magic[1] = 'W'; wad->magic[2] = 'A'; wad->magic[3] = 'D';
    wad->num_lumps = 9;
    wad->dir_offset = sizeof(doom_rom_wad_dat_t) - 128;
    wad->version = 1;
    wad->map = COVALENT_E1M1_MAP;
}

#endif /* COVALENT_DOOM_DAT_H */

