/**
 * ============================================================================
 * kernel/covalent_audiocraft_sequencer.c
 * IMPLEMENTATION: COVALENT AUDIOCRAFT TIME-DOMAIN SEQUENCER ORGANELLE
 * PROVENANCE: https://github.com/facebookresearch/audiocraft.git
 * ============================================================================
 */

#include "covalent_audiocraft_sequencer.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void audiocraft_sequencer_init(audiocraft_sequencer_state_t *state, q16_t bpm_q16) {
    if (!state) return;
    memset(state, 0, sizeof(audiocraft_sequencer_state_t));
    state->merkle_root_id = 0xAC0F0001; // AudioCraft Root (0xAC0F)
    state->current_bpm_q16 = bpm_q16 > 0 ? bpm_q16 : (q16_t)(120 * Q16_ONE);
    state->temporal_entropy_v_q16 = (q16_t)(0.10 * Q16_ONE);
    state->phase_accumulator_q16 = 0;
    state->current_beat = 0;
    state->current_bar = 0;

    for (int i = 0; i < MAX_SEQUENCE_TRACKS; i++) {
        state->active_tracks[i].track_id = i;
        state->active_tracks[i].target_f0_hz_q16 = (q16_t)((220 + i * 55) * Q16_ONE);
        state->active_tracks[i].velocity_q16 = (q16_t)(0.80 * Q16_ONE);
        state->active_tracks[i].is_active = (i < 4);
        strncpy(state->active_tracks[i].phoneme, "AA", 4);
    }
}

void audiocraft_sequencer_step_clock(audiocraft_sequencer_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Advance phase: phase += (BPM / 60) * dt
    q16_t beats_per_sec = q16_mul(state->current_bpm_q16, (q16_t)(0.016666 * Q16_ONE));
    state->phase_accumulator_q16 += q16_mul(beats_per_sec, dt_q16);

    while (state->phase_accumulator_q16 >= Q16_ONE) {
        state->phase_accumulator_q16 -= Q16_ONE;
        state->current_beat = (state->current_beat + 1) % MAX_BEATS_PER_BAR;
        if (state->current_beat == 0) {
            state->current_bar++;
        }
    }

    // Continuous Lyapunov temporal dissipation: dV/dt <= 0
    q16_t decay = q16_mul((q16_t)(0.03 * Q16_ONE), dt_q16);
    if (state->temporal_entropy_v_q16 > decay) {
        state->temporal_entropy_v_q16 -= decay;
    } else {
        state->temporal_entropy_v_q16 = (q16_t)(0.005 * Q16_ONE);
    }
}

bool audiocraft_sequencer_schedule_event(audiocraft_sequencer_state_t *state, uint32_t track_idx, q16_t f0_hz, const char* phoneme) {
    if (!state || track_idx >= MAX_SEQUENCE_TRACKS) return false;

    state->active_tracks[track_idx].target_f0_hz_q16 = f0_hz;
    state->active_tracks[track_idx].is_active = true;
    if (phoneme) {
        strncpy(state->active_tracks[track_idx].phoneme, phoneme, 3);
        state->active_tracks[track_idx].phoneme[3] = '\0';
    }
    state->temporal_entropy_v_q16 = (q16_t)(0.12 * Q16_ONE);
    return true;
}

q16_t audiocraft_sequencer_get_entropy(const audiocraft_sequencer_state_t *state) {
    return state ? state->temporal_entropy_v_q16 : 0;
}

