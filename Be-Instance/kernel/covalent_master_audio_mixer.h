/**
 * ============================================================================
 * kernel/covalent_master_audio_mixer.h
 * MODULE: COVALENT BARE-METAL MASTER AUDIO & MULTI-STEM MIXER
 * MATHEMATICAL INVARIANTS: 1 == 1, Studio Peak Dynamics Compression
 * ZERO EXTERNAL DEPENDENCIES
 * ============================================================================
 */

#ifndef COVALENT_MASTER_AUDIO_MIXER_H
#define COVALENT_MASTER_AUDIO_MIXER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MIXER_STEM_COUNT 6
#define MIXER_FFT_SIZE 256

typedef int32_t q16_t;

typedef enum {
    STEM_MASTER  = 0,
    STEM_TTS     = 1,
    STEM_AMPHION = 2,
    STEM_MUSIC   = 3,
    STEM_SFX     = 4,
    STEM_DRONE   = 5
} covalent_audio_stem_e;

typedef struct {
    q16_t stem_gains_q16[MIXER_STEM_COUNT];
    bool is_muted;
    q16_t current_peak_db_q16;
    uint32_t active_voices;
    uint32_t sample_rate_hz;
    uint8_t fft_bins[MIXER_FFT_SIZE / 2];
} covalent_master_mixer_state_t;

void covalent_mixer_init(covalent_master_mixer_state_t *mixer);
void covalent_mixer_set_gain(covalent_master_mixer_state_t *mixer, covalent_audio_stem_e stem, q16_t gain_q16);
void covalent_mixer_set_mute(covalent_master_mixer_state_t *mixer, bool mute);
void covalent_mixer_process_block(covalent_master_mixer_state_t *mixer, const int16_t *input_stems, int16_t *output_buffer, uint32_t samples_count);

#endif /* COVALENT_MASTER_AUDIO_MIXER_H */

