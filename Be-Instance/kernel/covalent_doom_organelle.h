/**
 * ============================================================================
 * kernel/covalent_doom_organelle.h
 * MODULE: COVALENT ID-DOOM-ETERNAL 3D ART ENGINE ORGANELLE
 * PARENT PROVENANCE: https://github.com/id-Software/DOOM.git
 * MATHEMATICAL INVARIANTS: Q16.16 Fixed-Point BSP Raycaster, Lyapunov dV/dt <= 0
 * ============================================================================
 */

#ifndef COVALENT_DOOM_ORGANELLE_H
#define COVALENT_DOOM_ORGANELLE_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define DOOM_FOV_Q16 0x0000B505 // ~64 degrees in Q16
#define DOOM_MAX_RAYS 128
#define DOOM_MAX_SECTORS 32
#define DOOM_AUDIO_CHANNELS 4

typedef int32_t q16_t;

typedef struct {
    q16_t player_x;
    q16_t player_y;
    q16_t player_angle_q16;
    q16_t player_vx;
    q16_t player_vy;
    uint32_t health;
    uint32_t armor;
    uint32_t ammo;
    uint32_t kills;
    bool weapon_firing;
} doom_player_state_t;

typedef struct {
    q16_t ray_dist_q16;
    uint32_t wall_texture_id;
    q16_t shade_intensity_q16;
    bool is_door;
} doom_ray_hit_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t kinetic_entropy_v_q16;     // Continuous Lyapunov entropy dV/dt <= 0
    q16_t sound_stem_gain_q16;       // Audio routing main stem gain
    q16_t heavy_metal_distortion_q16; // E1M1 synth distortion tensor
    uint32_t render_frame_count;
    doom_player_state_t player;
    doom_ray_hit_t ray_buffer[DOOM_MAX_RAYS];
} doom_engine_state_t;

void doom_organelle_init(doom_engine_state_t *state);
void doom_organelle_step_frame(doom_engine_state_t *state, q16_t dt_q16);
void doom_organelle_fire_weapon(doom_engine_state_t *state);
void doom_organelle_rotate_player(doom_engine_state_t *state, q16_t angle_delta_q16);
void doom_organelle_move_player(doom_engine_state_t *state, q16_t forward_q16, q16_t strafe_q16);
q16_t doom_organelle_get_entropy(const doom_engine_state_t *state);

#endif /* COVALENT_DOOM_ORGANELLE_H */

