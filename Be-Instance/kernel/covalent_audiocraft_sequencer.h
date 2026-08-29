/**
 * ============================================================================
 * kernel/covalent_audiocraft_sequencer.h
 * MODULE: COVALENT AUDIOCRAFT TIME-DOMAIN SEQUENCER ORGANELLE
 * PARENT PROVENANCE: https://github.com/facebookresearch/audiocraft.git
 * MATHEMATICAL INVARIANTS: Q16.16 Polyphonic BPM Clock & Lyapunov Decay dV/dt <= 0
 * ============================================================================
 */

#ifndef COVALENT_AUDIOCRAFT_SEQUENCER_H
#define COVALENT_AUDIOCRAFT_SEQUENCER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_SEQUENCE_TRACKS 8
#define MAX_BEATS_PER_BAR 16

typedef int32_t q16_t;

typedef struct {
    uint32_t track_id;
    q16_t target_f0_hz_q16;
    q16_t velocity_q16;
    bool is_active;
    char phoneme[4];
} audiocraft_track_event_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t current_bpm_q16;
    q16_t temporal_entropy_v_q16;
    q16_t phase_accumulator_q16;
    uint32_t current_beat;
    uint32_t current_bar;
    audiocraft_track_event_t active_tracks[MAX_SEQUENCE_TRACKS];
} audiocraft_sequencer_state_t;

void audiocraft_sequencer_init(audiocraft_sequencer_state_t *state, q16_t bpm_q16);
void audiocraft_sequencer_step_clock(audiocraft_sequencer_state_t *state, q16_t dt_q16);
bool audiocraft_sequencer_schedule_event(audiocraft_sequencer_state_t *state, uint32_t track_idx, q16_t f0_hz, const char* phoneme);
q16_t audiocraft_sequencer_get_entropy(const audiocraft_sequencer_state_t *state);

#endif /* COVALENT_AUDIOCRAFT_SEQUENCER_H */

