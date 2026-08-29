/* kernel/covalent_i2s_audio.h - Bare-Metal Autopoietic Vocal Tract */
#ifndef COVALENT_I2S_AUDIO_H
#define COVALENT_I2S_AUDIO_H

#include "covalent_fb0_driver.h"

#define I2S_BUFFER_SIZE 4096
#define SAMPLE_RATE 48000

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int32_t q16_phase_432;
    int32_t q16_phase_852;
    int16_t dma_buffer[I2S_BUFFER_SIZE];
    uint32_t buffer_idx;
    uint32_t total_samples_emitted;
} covalent_vocal_tract_t;

void covalent_vocal_tract_init(covalent_vocal_tract_t* tract);
void covalent_audio_dma_fill(covalent_vocal_tract_t* tract, int32_t current_lyapunov_v);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_I2S_AUDIO_H */

