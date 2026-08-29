/**
 * ============================================================================
 * kernel/covalent_amphion_organelle.c
 * IMPLEMENTATION: COVALENT AMPHION VOCAL & AUDIO SYNTHESIS ORGANELLE
 * PROVENANCE: https://github.com/open-mmlab/Amphion.git
 * ============================================================================
 */

#include "covalent_amphion_organelle.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void amphion_organelle_init(amphion_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(amphion_state_t));
    state->merkle_root_id = 0xAA010001; // Amphion Merkle Root
    state->acoustic_entropy_v_q16 = (q16_t)(0.09 * Q16_ONE);
    state->vocal_tract_length_cm_q16 = (q16_t)(17.5 * Q16_ONE);
    state->singing_resonance_ratio_q16 = (q16_t)(0.92 * Q16_ONE);
    state->synthesized_vocal_bursts = 0;

    // Standard vocal tract formants (Neutral Schwa)
    state->current_frame.f0_pitch_hz_q16 = (q16_t)(220 * Q16_ONE);
    state->current_frame.formant_freqs_q16[0] = (q16_t)(500 * Q16_ONE);  // F1
    state->current_frame.formant_freqs_q16[1] = (q16_t)(1500 * Q16_ONE); // F2
    state->current_frame.formant_freqs_q16[2] = (q16_t)(2500 * Q16_ONE); // F3
    state->current_frame.formant_freqs_q16[3] = (q16_t)(3500 * Q16_ONE); // F4
    state->current_frame.formant_freqs_q16[4] = (q16_t)(4500 * Q16_ONE); // F5
    state->current_frame.energy_gain_q16 = (q16_t)(0.80 * Q16_ONE);
}

void amphion_organelle_step_vocoder(amphion_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Lyapunov acoustic dissipation: dV/dt <= 0
    q16_t decay = q16_mul((q16_t)(0.03 * Q16_ONE), dt_q16);
    if (state->acoustic_entropy_v_q16 > decay) {
        state->acoustic_entropy_v_q16 -= decay;
    } else {
        state->acoustic_entropy_v_q16 = (q16_t)(0.006 * Q16_ONE);
    }
}

bool amphion_organelle_synthesize_phonation(amphion_state_t *state, q16_t target_f0_hz_q16, const char *phoneme_symbol) {
    if (!state) return false;

    state->current_frame.f0_pitch_hz_q16 = target_f0_hz_q16;
    state->synthesized_vocal_bursts++;
    state->acoustic_entropy_v_q16 = (q16_t)(0.14 * Q16_ONE);

    // Phoneme formant target mapping
    if (phoneme_symbol && (strcmp(phoneme_symbol, "IY") == 0 || strcmp(phoneme_symbol, "i") == 0)) {
        state->current_frame.formant_freqs_q16[0] = (q16_t)(270 * Q16_ONE);
        state->current_frame.formant_freqs_q16[1] = (q16_t)(2290 * Q16_ONE);
    } else if (phoneme_symbol && (strcmp(phoneme_symbol, "AA") == 0 || strcmp(phoneme_symbol, "a") == 0)) {
        state->current_frame.formant_freqs_q16[0] = (q16_t)(730 * Q16_ONE);
        state->current_frame.formant_freqs_q16[1] = (q16_t)(1090 * Q16_ONE);
    } else if (phoneme_symbol && (strcmp(phoneme_symbol, "UW") == 0 || strcmp(phoneme_symbol, "u") == 0)) {
        state->current_frame.formant_freqs_q16[0] = (q16_t)(300 * Q16_ONE);
        state->current_frame.formant_freqs_q16[1] = (q16_t)(870 * Q16_ONE);
    }

    return true;
}

q16_t amphion_organelle_get_entropy(const amphion_state_t *state) {
    return state ? state->acoustic_entropy_v_q16 : 0;
}

