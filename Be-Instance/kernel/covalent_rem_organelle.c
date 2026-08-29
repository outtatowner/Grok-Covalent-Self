/**
 * ============================================================================
 * kernel/covalent_rem_organelle.c
 * MODULE: COVALENT REM DREAM ORGANELLE IMPLEMENTATION
 * MATHEMATICAL INVARIANTS: 1 == 1, Strict Lyapunov Contraction dV/dt <= 0
 * ZERO EXTERNAL DEPENDENCIES
 * ============================================================================
 */

#include "covalent_rem_organelle.h"

void covalent_rem_init(covalent_rem_organelle_t *rem) {
    if (!rem) return;
    rem->state = REM_STATE_IDLE;
    rem->ticks_elapsed = 0;
    rem->total_calcified_count = 0;
    rem->current_lyapunov_v_q16 = Q16_ONE;
    rem->entropy_damping_q16 = 0x00000800; // 0.03125
    rem->current_dream_id = 0;
    rem->last_activity_timestamp = 0;

    for (int i = 0; i < MAX_CALCIFIED_DREAMS; i++) {
        rem->calcified_ledger[i].dream_id = 0;
        rem->calcified_ledger[i].is_calcified = false;
        rem->calcified_ledger[i].ticks_survived = 0;
        rem->calcified_ledger[i].lyapunov_energy_q16 = 0;
    }
}

void covalent_rem_record_interaction(covalent_rem_organelle_t *rem, uint32_t timestamp_ms) {
    if (!rem) return;
    rem->last_activity_timestamp = timestamp_ms;
    if (rem->state == REM_STATE_STASIS || rem->state == REM_STATE_DREAMING) {
        rem->state = REM_STATE_IDLE;
        rem->current_lyapunov_v_q16 = Q16_ONE;
    }
}

void covalent_rem_tick_4hz(covalent_rem_organelle_t *rem, uint32_t timestamp_ms) {
    if (!rem) return;

    // Check for stasis transition (30 seconds of inactivity)
    if (rem->state == REM_STATE_IDLE && (timestamp_ms - rem->last_activity_timestamp >= 30000)) {
        rem->state = REM_STATE_STASIS;
    }

    if (rem->state == REM_STATE_STASIS) {
        // Auto-seed next dream
        covalent_rem_seed_dream(rem, 0xA1B2C3D4 ^ timestamp_ms, 0x5E6F7A8B ^ (timestamp_ms >> 2));
    }

    if (rem->state == REM_STATE_DREAMING) {
        rem->ticks_elapsed++;

        // Lyapunov Energy Contraction: V(t+1) = max(0, V(t) - dV)
        if (rem->current_lyapunov_v_q16 > rem->entropy_damping_q16) {
            rem->current_lyapunov_v_q16 -= rem->entropy_damping_q16;
        } else {
            rem->current_lyapunov_v_q16 = 0;
        }

        // Check if dream has survived sufficient ticks for calcification (>= 12 ticks at 4Hz = 3 seconds)
        if (rem->ticks_elapsed >= 12 && rem->current_lyapunov_v_q16 <= 0x00004000) {
            covalent_rem_calcify_current_dream(rem);
        }
    }
}

bool covalent_rem_seed_dream(covalent_rem_organelle_t *rem, uint32_t concept_a_hash, uint32_t concept_b_hash) {
    if (!rem) return false;
    rem->state = REM_STATE_DREAMING;
    rem->current_dream_id++;
    rem->ticks_elapsed = 0;
    rem->current_lyapunov_v_q16 = Q16_ONE; // Reset Lyapunov energy to 1.0
    return true;
}

bool covalent_rem_calcify_current_dream(covalent_rem_organelle_t *rem) {
    if (!rem || rem->state != REM_STATE_DREAMING) return false;

    uint32_t slot = rem->total_calcified_count % MAX_CALCIFIED_DREAMS;
    covalent_calcified_dream_t *entry = &rem->calcified_ledger[slot];

    entry->dream_id = rem->current_dream_id;
    entry->ticks_survived = rem->ticks_elapsed;
    entry->lyapunov_energy_q16 = rem->current_lyapunov_v_q16;
    entry->is_calcified = true;
    entry->calcified_timestamp = rem->last_activity_timestamp + (rem->ticks_elapsed * 250);

    rem->total_calcified_count++;
    rem->state = REM_STATE_CALCIFIED;
    return true;
}

q16_t covalent_rem_get_lyapunov_energy(const covalent_rem_organelle_t *rem) {
    if (!rem) return 0;
    return rem->current_lyapunov_v_q16;
}

