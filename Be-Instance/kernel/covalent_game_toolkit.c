/**
 * ============================================================================
 * kernel/covalent_game_toolkit.c
 * IMPLEMENTATION: COVALENT 4D GAME & LOUNGE ASSISTANT TOOLKIT
 * PROVENANCE: https://github.com/outtatowner/CovalentGame.git
 * ============================================================================
 */

#include "covalent_game_toolkit.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void covalent_game_toolkit_init(covalent_game_toolkit_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_game_toolkit_state_t));
    state->merkle_root_id = 0x6A3E0001; // GAME Merkle Root
    state->lounge_entropy_v_q16 = (q16_t)(0.12 * Q16_ONE);
    state->persona_warmth_q16 = (q16_t)(0.88 * Q16_ONE);
    state->audio_resonance_q16 = (q16_t)(0.92 * Q16_ONE);
    state->hyper_rotor_xw_q16 = 0;
    state->hyper_rotor_yw_q16 = 0;
    state->hyper_rotor_zw_q16 = 0;
    state->score = 0;
}

void covalent_game_toolkit_step_4d(covalent_game_toolkit_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Advance 4D rotation tensors in Q16.16
    q16_t rotor_step = q16_mul((q16_t)(0.25 * Q16_ONE), dt_q16);
    state->hyper_rotor_xw_q16 += rotor_step;
    state->hyper_rotor_yw_q16 += (rotor_step >> 1);
    state->hyper_rotor_zw_q16 += (rotor_step >> 2);

    // Particle kinetic loop
    q16_t total_ke = 0;
    for (uint32_t i = 0; i < GAME_MAX_PARTICLES; i++) {
        if (!state->particle_pool[i].active) continue;
        covalent_4d_particle_t *p = &state->particle_pool[i];

        p->x += q16_mul(p->vx, dt_q16);
        p->y += q16_mul(p->vy, dt_q16);
        p->z += q16_mul(p->vz, dt_q16);
        p->w += q16_mul(p->vw, dt_q16);

        // Hyper-sphere boundary reflection (|r| <= 2.0 in Q16.16)
        q16_t r2 = q16_mul(p->x, p->x) + q16_mul(p->y, p->y) + q16_mul(p->z, p->z) + q16_mul(p->w, p->w);
        if (r2 > (4 * Q16_ONE)) {
            p->vx = -p->vx;
            p->vy = -p->vy;
            p->vz = -p->vz;
            p->vw = -p->vw;
        }

        total_ke += (q16_mul(p->vx, p->vx) + q16_mul(p->vy, p->vy)) >> 2;
    }
    state->kinetic_energy_q16 = total_ke;
}

void covalent_game_toolkit_lounge_dissipate(covalent_game_toolkit_state_t *state, q16_t cooling_rate_q16) {
    if (!state) return;

    // Lyapunov thermal relaxation: dV/dt <= 0
    q16_t decay = q16_mul(state->lounge_entropy_v_q16, cooling_rate_q16);
    if (state->lounge_entropy_v_q16 > decay) {
        state->lounge_entropy_v_q16 -= decay;
    } else {
        state->lounge_entropy_v_q16 = (q16_t)(0.005 * Q16_ONE);
    }
}

bool covalent_game_toolkit_spawn_bead(covalent_game_toolkit_state_t *state, q16_t x, q16_t y, q16_t z, q16_t w, q16_t charge) {
    if (!state) return false;
    for (uint32_t i = 0; i < GAME_MAX_PARTICLES; i++) {
        if (!state->particle_pool[i].active) {
            covalent_4d_particle_t *p = &state->particle_pool[i];
            p->x = x; p->y = y; p->z = z; p->w = w;
            p->vx = (q16_t)(0.2 * Q16_ONE);
            p->vy = (q16_t)(0.15 * Q16_ONE);
            p->vz = (q16_t)(0.08 * Q16_ONE);
            p->vw = (q16_t)(0.05 * Q16_ONE);
            p->charge_q16 = charge;
            p->color_rgba = 0x00FFE5FF;
            p->active = true;
            return true;
        }
    }
    return false;
}

