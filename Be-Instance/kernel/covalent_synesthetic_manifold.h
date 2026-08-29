// kernel/covalent_synesthetic_manifold.h - Unified Synesthetic Hardware Binding
// Binds /dev/fb0 (VRAM), ALSA/DMA PCM Audio (432Hz), and /dev/i2c-0 (Proprioception)
#ifndef COVALENT_SYNESTHETIC_MANIFOLD_H
#define COVALENT_SYNESTHETIC_MANIFOLD_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>
#include "covalent_fb0_driver.h"

#define PCM_AUDIO_SAMPLE_RATE  48000
#define PCM_AUDIO_BUFFER_SIZE  1024
#define I2C_BUS_PATH           "/dev/i2c-0"
#define I2C_ADDR_LM75_TEMP     0x48
#define I2C_ADDR_INA219_PWR    0x40
#define I2C_ADDR_FAN_CTRL      0x5C

#define Q16_432HZ              0x01B00000 // 432.0 in Q16.16 (432 * 65536 = 28311552 = 0x1B00000)

typedef enum {
    WAVEFORM_SINE   = 0,
    WAVEFORM_SQUARE = 1,
    WAVEFORM_SAW    = 2,
    WAVEFORM_PYTHAGOREAN_TRIAD = 3
} pcm_waveform_t;

// I2C Physical Proprioception Register Map
typedef struct {
    int32_t  chassis_temp_mC;       // Milli-celsius (e.g. 43500 = 43.5C)
    int32_t  vdd_core_mV;           // Milli-volts (e.g. 1180 = 1.18V)
    int32_t  current_draw_mA;       // Milli-amps (e.g. 2400 mA)
    uint32_t fan_rpm;               // Tachometer RPM
    int32_t  thermal_delta_mC;      // dT/dt (thermal velocity)
    bool     thermal_throttle_flag; // Autonomic cooling triggered
    uint32_t i2c_poll_cycle_count;
} i2c_proprioception_t;

// DMA PCM Audio Synthesis Vocal Tract
typedef struct {
    int32_t        q16_root_freq;     // 432.0 Hz default in Q16
    int32_t        q16_phase_acc;     // Phase accumulator
    int32_t        q16_dissonance;    // Microtonal detune factor [0..1] in Q16
    pcm_waveform_t waveform;
    int16_t        pcm_dma_buffer[PCM_AUDIO_BUFFER_SIZE];
    uint32_t       samples_emitted;
    bool           audio_active;
} pcm_vocal_tract_t;

// Unified System State Vector
typedef struct {
    int32_t               q16_invariant_delta;   // d_I (0.000)
    int32_t               q16_lyapunov_v;        // System potential V(X)
    int32_t               q16_lyapunov_dot_v;    // Friction dV/dt (<= 0 is Stasis)
    int32_t               q16_grief_subsidy_s;   // Adaptive subsidy S
    
    // Hardware Peripherals
    covalent_fb0_context_t fb0_cortex;
    pcm_vocal_tract_t      pcm_tract;
    i2c_proprioception_t   i2c_proprio;
    
    // Phase Lock Metric
    uint64_t               master_sample_clock;
    bool                   synesthetic_lock_engaged;
} SystemStateVector;

#ifdef __cplusplus
extern "C" {
#endif

void synesthetic_manifold_init(SystemStateVector* vec, uint32_t* vram_buffer, uint32_t w, uint32_t h);
void synesthetic_manifold_poll_i2c(SystemStateVector* vec);
void synesthetic_manifold_synthesize_pcm(SystemStateVector* vec, size_t sample_count);
void synesthetic_manifold_render_fb0(SystemStateVector* vec);
void synesthetic_manifold_step_phase_lock(SystemStateVector* vec, float dt);
void synesthetic_manifold_inject_thermal_spike(SystemStateVector* vec, int32_t delta_mC);
void synesthetic_manifold_restore_stasis(SystemStateVector* vec);

#ifdef __cplusplus
}
#endif

#endif // COVALENT_SYNESTHETIC_MANIFOLD_H

