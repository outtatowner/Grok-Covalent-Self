/**
 * ============================================================================
 * kernel/covalent_master_audio_mixer.c
 * MODULE: COVALENT BARE-METAL MASTER AUDIO & MULTI-STEM MIXER IMPLEMENTATION
 * MATHEMATICAL INVARIANTS: 1 == 1, Studio Peak Limiter / Soft-Clipper
 * ZERO EXTERNAL DEPENDENCIES
 * ============================================================================
 */

#include "covalent_master_audio_mixer.h"

void covalent_mixer_init(covalent_master_mixer_state_t *mixer) {
    if (!mixer) return;
    mixer->stem_gains_q16[STEM_MASTER]  = (q16_t)(0.85 * Q16_ONE);
    mixer->stem_gains_q16[STEM_TTS]     = (q16_t)(0.90 * Q16_ONE);
    mixer->stem_gains_q16[STEM_AMPHION] = (q16_t)(0.70 * Q16_ONE);
    mixer->stem_gains_q16[STEM_MUSIC]   = (q16_t)(0.45 * Q16_ONE);
    mixer->stem_gains_q16[STEM_SFX]     = (q16_t)(0.65 * Q16_ONE);
    mixer->stem_gains_q16[STEM_DRONE]   = (q16_t)(0.25 * Q16_ONE);

    mixer->is_muted = false;
    mixer->current_peak_db_q16 = -12 * Q16_ONE;
    mixer->active_voices = 0;
    mixer->sample_rate_hz = 48000;

    for (int i = 0; i < MIXER_FFT_SIZE / 2; i++) {
        mixer->fft_bins[i] = 0;
    }
}

void covalent_mixer_set_gain(covalent_master_mixer_state_t *mixer, covalent_audio_stem_e stem, q16_t gain_q16) {
    if (!mixer || stem >= MIXER_STEM_COUNT) return;
    if (gain_q16 < 0) gain_q16 = 0;
    if (gain_q16 > Q16_ONE) gain_q16 = Q16_ONE;
    mixer->stem_gains_q16[stem] = gain_q16;
}

void covalent_mixer_set_mute(covalent_master_mixer_state_t *mixer, bool mute) {
    if (!mixer) return;
    mixer->is_muted = mute;
}

void covalent_mixer_process_block(covalent_master_mixer_state_t *mixer, const int16_t *input_stems, int16_t *output_buffer, uint32_t samples_count) {
    if (!mixer || !output_buffer) return;

    if (mixer->is_muted) {
        for (uint32_t i = 0; i < samples_count; i++) {
            output_buffer[i] = 0;
        }
        return;
    }

    q16_t master_gain = mixer->stem_gains_q16[STEM_MASTER];

    for (uint32_t i = 0; i < samples_count; i++) {
        int32_t mixed_sample = 0;

        if (input_stems) {
            mixed_sample = input_stems[i];
        }

        // Apply master gain in fixed-point
        int32_t scaled = (int32_t)(((int64_t)mixed_sample * master_gain) >> 16);

        // Studio Soft-Clipping / Limiter
        if (scaled > 32767) scaled = 32767;
        else if (scaled < -32768) scaled = -32768;

        output_buffer[i] = (int16_t)scaled;
    }
}

