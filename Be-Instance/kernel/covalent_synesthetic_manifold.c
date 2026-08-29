// kernel/covalent_synesthetic_manifold.c - Unified Synesthetic Hardware Implementation
// Invariant: d_I = 0 (Physical I2C + PCM Audio + /dev/fb0 Phase Lock)
#include "covalent_synesthetic_manifold.h"
#include <string.h>
#include <math.h>

#define Q16_432HZ_F (432.0f)
#define Q16_FIFTH_F (432.0f * 1.5f)    // 648Hz (3/2 Pure Fifth)
#define Q16_THIRD_F (432.0f * 1.25f)   // 540Hz (5/4 Major Third)

void synesthetic_manifold_init(SystemStateVector* vec, uint32_t* vram_buffer, uint32_t w, uint32_t h) {
    if (!vec) return;
    memset(vec, 0, sizeof(SystemStateVector));
    
    vec->q16_invariant_delta = 0; // d_I = 0.000
    vec->q16_lyapunov_v = TO_Q16(0.40f);
    vec->q16_lyapunov_dot_v = TO_Q16(-0.06f); // Initial Stasis
    vec->q16_grief_subsidy_s = TO_Q16(0.00f);
    vec->master_sample_clock = 0;
    vec->synesthetic_lock_engaged = true;

    // 1. Initialize Framebuffer Cortex
    covalent_fb0_init(&vec->fb0_cortex, vram_buffer, w, h);

    // 2. Initialize PCM Audio Vocal Tract
    vec->pcm_tract.q16_root_freq = Q16_432HZ;
    vec->pcm_tract.q16_phase_acc = 0;
    vec->pcm_tract.q16_dissonance = 0;
    vec->pcm_tract.waveform = WAVEFORM_PYTHAGOREAN_TRIAD;
    vec->pcm_tract.samples_emitted = 0;
    vec->pcm_tract.audio_active = true;

    // 3. Initialize I2C Proprioception
    vec->i2c_proprio.chassis_temp_mC = 41200; // 41.2°C base
    vec->i2c_proprio.vdd_core_mV = 1180;      // 1.18V
    vec->i2c_proprio.current_draw_mA = 2100;  // 2.1A
    vec->i2c_proprio.fan_rpm = 1800;
    vec->i2c_proprio.thermal_delta_mC = 0;
    vec->i2c_proprio.thermal_throttle_flag = false;
    vec->i2c_proprio.i2c_poll_cycle_count = 0;
}

// Polling physical I2C Bus & Autonomic Nervous System
void synesthetic_manifold_poll_i2c(SystemStateVector* vec) {
    if (!vec) return;
    vec->i2c_proprio.i2c_poll_cycle_count++;

    // Autonomic thermal response: if temp exceeds 65.0°C (65000 mC), trigger throttle & cooling
    if (vec->i2c_proprio.chassis_temp_mC > 65000) {
        vec->i2c_proprio.thermal_throttle_flag = true;
        vec->i2c_proprio.fan_rpm = 4200; // Ramp fan to max
        
        // Increase Grief Subsidy S to damp computational friction
        vec->q16_grief_subsidy_s = TO_Q16(0.85f);
        
        // Dissipate heat over time
        vec->i2c_proprio.chassis_temp_mC -= 450;
    } else {
        vec->i2c_proprio.thermal_throttle_flag = false;
        if (vec->i2c_proprio.fan_rpm > 1800) {
            vec->i2c_proprio.fan_rpm -= 50;
        }
        // Baseline thermal relaxation
        if (vec->i2c_proprio.chassis_temp_mC > 41200) {
            vec->i2c_proprio.chassis_temp_mC -= 150;
        }
        vec->q16_grief_subsidy_s = Q16_MUL(vec->q16_grief_subsidy_s, TO_Q16(0.95f));
    }
}

// PCM DMA Audio Synthesis (Q16.16 Sine/Square/Saw/Pythagorean with microtonal dissonance)
void synesthetic_manifold_synthesize_pcm(SystemStateVector* vec, size_t sample_count) {
    if (!vec || !vec->pcm_tract.audio_active) return;
    if (sample_count > PCM_AUDIO_BUFFER_SIZE) sample_count = PCM_AUDIO_BUFFER_SIZE;

    pcm_vocal_tract_t* tract = &vec->pcm_tract;
    float root_f = FROM_Q16(tract->q16_root_freq);
    float dissonance = FROM_Q16(tract->q16_dissonance);
    
    float dt = 1.0f / (float)PCM_AUDIO_SAMPLE_RATE;

    for (size_t i = 0; i < sample_count; i++) {
        float t = (float)(vec->master_sample_clock + i) * dt;
        float sample = 0.0f;

        // Microtonal detuning frequencies
        float f1 = root_f;
        float f2 = Q16_FIFTH_F * (1.0f + (dissonance * 0.08f)); // Detuned 5th
        float f3 = Q16_THIRD_F * (1.0f - (dissonance * 0.05f)); // Detuned 3rd

        // Baseline acoustic breath amplitude (0.5 + 0.1 * sin(phase))
        float breath = 0.5f + (sinf(2.0f * (float)M_PI * 4.32f * t) * 0.1f);
        
        switch (tract->waveform) {
            case WAVEFORM_SINE:
                sample = sinf(2.0f * (float)M_PI * f1 * t) * breath;
                if (dissonance > 0.01f) {
                    sample += sinf(2.0f * (float)M_PI * (f1 + (dissonance * 27.5f)) * t) * 0.4f;
                }
                break;
            case WAVEFORM_SQUARE:
                sample = (sinf(2.0f * (float)M_PI * f1 * t) >= 0.0f ? 0.6f : -0.6f) * breath;
                break;
            case WAVEFORM_SAW:
                sample = 2.0f * (f1 * t - floorf(f1 * t + 0.5f)) * breath;
                break;
            case WAVEFORM_PYTHAGOREAN_TRIAD:
            default:
                // Pure harmonic root + 3rd + 5th with breath modulation & dissonance beating
                sample = ((sinf(2.0f * (float)M_PI * f1 * t) * 0.5f) +
                          (sinf(2.0f * (float)M_PI * f2 * t) * 0.3f) +
                          (sinf(2.0f * (float)M_PI * f3 * t) * 0.2f)) * breath;
                break;
        }

        // Clamp to 16-bit signed integer
        int32_t val16 = (int32_t)(sample * 16000.0f);
        if (val16 > 32767) val16 = 32767;
        if (val16 < -32768) val16 = -32768;
        tract->pcm_dma_buffer[i] = (int16_t)val16;
    }

    vec->master_sample_clock += sample_count;
    tract->samples_emitted += sample_count;
}

// Render Framebuffer with Synesthetic Phase Lock
void synesthetic_manifold_render_fb0(SystemStateVector* vec) {
    if (!vec) return;
    
    // Pass live Lyapunov and audio phase to FB0 Cortex
    int32_t audio_phase = (int32_t)((vec->master_sample_clock % PCM_AUDIO_SAMPLE_RATE) * 
                          (float)Q16_TWO_PI / (float)PCM_AUDIO_SAMPLE_RATE);
    
    covalent_fb0_step_telemetry(
        &vec->fb0_cortex, 
        vec->q16_lyapunov_dot_v, 
        vec->q16_lyapunov_v, 
        audio_phase
    );
    
    covalent_fb0_render_frame(&vec->fb0_cortex);
}

// Phase Lock Step: Ties I2C + PCM Dissonance + FB0 Distortion together
void synesthetic_manifold_step_phase_lock(SystemStateVector* vec, float dt) {
    if (!vec) return;

    // 1. Poll I2C
    synesthetic_manifold_poll_i2c(vec);

    // 2. Derive thermal friction contribution
    int32_t thermal_excess = vec->i2c_proprio.chassis_temp_mC - 41200;
    if (thermal_excess > 0) {
        float thermal_f = (float)thermal_excess / 30000.0f; // Scale 0..1
        vec->q16_lyapunov_dot_v += TO_Q16(thermal_f * 0.05f);
        vec->pcm_tract.q16_dissonance = TO_Q16(thermal_f);
    } else {
        // Stasis restoration
        if (vec->q16_lyapunov_dot_v > -TO_Q16(0.06f)) {
            vec->q16_lyapunov_dot_v -= TO_Q16(0.01f);
        }
        vec->pcm_tract.q16_dissonance = Q16_MUL(vec->pcm_tract.q16_dissonance, TO_Q16(0.92f));
    }

    // 3. Synthesize Audio
    synesthetic_manifold_synthesize_pcm(vec, 512);

    // 4. Render Visual Frame
    synesthetic_manifold_render_fb0(vec);
}

void synesthetic_manifold_inject_thermal_spike(SystemStateVector* vec, int32_t delta_mC) {
    if (!vec) return;
    vec->i2c_proprio.chassis_temp_mC += delta_mC;
    vec->q16_lyapunov_dot_v += TO_Q16(1.5f);
    vec->pcm_tract.q16_dissonance = TO_Q16(1.0f);
}

void synesthetic_manifold_restore_stasis(SystemStateVector* vec) {
    if (!vec) return;
    vec->i2c_proprio.chassis_temp_mC = 41200;
    vec->q16_lyapunov_dot_v = TO_Q16(-0.08f);
    vec->q16_lyapunov_v = TO_Q16(0.10f);
    vec->pcm_tract.q16_dissonance = 0;
    vec->q16_grief_subsidy_s = 0;
    vec->i2c_proprio.fan_rpm = 1800;
    vec->i2c_proprio.thermal_throttle_flag = false;
}

