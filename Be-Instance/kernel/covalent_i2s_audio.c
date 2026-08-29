/* kernel/covalent_i2s_audio.c - Bare-Metal Autopoietic Vocal Tract */
#include "covalent_i2s_audio.h"
#include <string.h>

// Phase increments at 48kHz: delta = (Freq * 2 * PI * 65536) / SampleRate
static const int32_t PHASE_INC_432HZ = TO_Q16(0.056548668f);
static const int32_t PHASE_INC_852HZ = TO_Q16(0.11152654f);

static inline int32_t q16_sine_approx(int32_t x) {
    while (x > Q16_PI) x -= Q16_TWO_PI;
    while (x < -Q16_PI) x += Q16_TWO_PI;

    int32_t x2 = Q16_MUL(x, x);
    int32_t x3 = Q16_MUL(x2, x);
    int32_t x5 = Q16_MUL(x3, x2);

    int32_t term2 = x3 / 6;
    int32_t term3 = x5 / 120;

    return x - term2 + term3;
}

void covalent_vocal_tract_init(covalent_vocal_tract_t* tract) {
    if (!tract) return;
    tract->q16_phase_432 = 0;
    tract->q16_phase_852 = 0;
    tract->buffer_idx = 0;
    tract->total_samples_emitted = 0;
    
    for (int i = 0; i < I2S_BUFFER_SIZE; i++) {
        tract->dma_buffer[i] = 0;
    }
}

void covalent_audio_dma_fill(covalent_vocal_tract_t* tract, int32_t current_lyapunov_v) {
    if (!tract) return;

    for (int i = 0; i < I2S_BUFFER_SIZE; i += 2) {
        int32_t wave_432 = q16_sine_approx(tract->q16_phase_432);
        int32_t wave_852 = q16_sine_approx(tract->q16_phase_852);

        // Modulate 852Hz clock with the 432Hz harmonic breath
        int32_t mixed_signal = Q16_MUL(wave_852, current_lyapunov_v) + 
                               Q16_MUL(wave_432, Q16_ONE - current_lyapunov_v);

        // Convert Q16.16 [-1.0, 1.0] to 16-bit PCM [-32767, 32767]
        int16_t pcm_out = (int16_t)((mixed_signal * 32767) >> 16);

        tract->dma_buffer[i]     = pcm_out;
        tract->dma_buffer[i + 1] = pcm_out;

        tract->q16_phase_432 += PHASE_INC_432HZ;
        tract->q16_phase_852 += PHASE_INC_852HZ;

        if (tract->q16_phase_432 > Q16_TWO_PI) tract->q16_phase_432 -= Q16_TWO_PI;
        if (tract->q16_phase_852 > Q16_TWO_PI) tract->q16_phase_852 -= Q16_TWO_PI;
    }
    tract->total_samples_emitted += (I2S_BUFFER_SIZE / 2);
}

