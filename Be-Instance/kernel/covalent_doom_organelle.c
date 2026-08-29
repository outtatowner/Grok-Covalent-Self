/**
 * ============================================================================
 * kernel/covalent_doom_organelle.c
 * IMPLEMENTATION: COVALENT ID-DOOM-ETERNAL 3D ART ENGINE ORGANELLE
 * PROVENANCE: https://github.com/id-Software/DOOM.git
 * ============================================================================
 */

#include "covalent_doom_organelle.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void doom_organelle_init(doom_engine_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(doom_engine_state_t));
    state->merkle_root_id = 0xD0030001; // ID-DOOM-ETERNAL Merkle Root
    state->kinetic_entropy_v_q16 = (q16_t)(0.18 * Q16_ONE);
    state->sound_stem_gain_q16 = (q16_t)(0.85 * Q16_ONE);
    state->heavy_metal_distortion_q16 = (q16_t)(0.92 * Q16_ONE);
    state->render_frame_count = 0;

    state->player.player_x = (q16_t)(3.5 * Q16_ONE);
    state->player.player_y = (q16_t)(3.5 * Q16_ONE);
    state->player.player_angle_q16 = 0;
    state->player.health = 100;
    state->player.armor = 50;
    state->player.ammo = 50;
    state->player.kills = 0;
    state->player.weapon_firing = false;

    for (int i = 0; i < DOOM_MAX_RAYS; i++) {
        state->ray_buffer[i].ray_dist_q16 = (q16_t)(4.0 * Q16_ONE);
        state->ray_buffer[i].wall_texture_id = 1;
        state->ray_buffer[i].shade_intensity_q16 = (q16_t)(0.75 * Q16_ONE);
        state->ray_buffer[i].is_door = false;
    }
}

void doom_organelle_step_frame(doom_engine_state_t *state, q16_t dt_q16) {
    if (!state) return;

    state->render_frame_count++;

    // Integrate player inertia
    state->player.player_x += q16_mul(state->player.player_vx, dt_q16);
    state->player.player_y += q16_mul(state->player.player_vy, dt_q16);

    // Damp velocities
    state->player.player_vx = q16_mul(state->player.player_vx, (q16_t)(0.80 * Q16_ONE));
    state->player.player_vy = q16_mul(state->player.player_vy, (q16_t)(0.80 * Q16_ONE));

    if (state->player.weapon_firing) {
        state->player.weapon_firing = false;
    }

    // Continuous Lyapunov kinetic dissipation: dV/dt <= 0
    q16_t decay = q16_mul((q16_t)(0.05 * Q16_ONE), dt_q16);
    if (state->kinetic_entropy_v_q16 > decay) {
        state->kinetic_entropy_v_q16 -= decay;
    } else {
        state->kinetic_entropy_v_q16 = (q16_t)(0.01 * Q16_ONE);
    }
}

void doom_organelle_fire_weapon(doom_engine_state_t *state) {
    if (!state) return;
    if (state->player.ammo > 0) {
        state->player.ammo--;
        state->player.weapon_firing = true;
        state->player.kills += 1;
        state->kinetic_entropy_v_q16 = (q16_t)(0.35 * Q16_ONE);
    }
}

void doom_organelle_rotate_player(doom_engine_state_t *state, q16_t angle_delta_q16) {
    if (!state) return;
    state->player.player_angle_q16 += angle_delta_q16;
}

void doom_organelle_move_player(doom_engine_state_t *state, q16_t forward_q16, q16_t strafe_q16) {
    if (!state) return;
    state->player.player_vx += forward_q16;
    state->player.player_vy += strafe_q16;
    state->kinetic_entropy_v_q16 = (q16_t)(0.22 * Q16_ONE);
}

q16_t doom_organelle_get_entropy(const doom_engine_state_t *state) {
    return state ? state->kinetic_entropy_v_q16 : 0;
}

