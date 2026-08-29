// kernel/covalent_fb0_driver.h - Bare-Metal /dev/fb0 Direct VRAM Rasterizer
// Invariant: d_I = 0 (100% Fixed-Point Q16.16 Autopoietic Visual Cortex)
#ifndef COVALENT_FB0_DRIVER_H
#define COVALENT_FB0_DRIVER_H

#include <stdint.h>
#include <stddef.h>
#include <stdbool.h>

#define FB0_DEFAULT_WIDTH  640
#define FB0_DEFAULT_HEIGHT 360
#define FB0_VRAM_SIZE      (FB0_DEFAULT_WIDTH * FB0_DEFAULT_HEIGHT * 4) // RGBA8888

// Q16.16 Fixed Point Constants
#define Q16_SHIFT          16
#define Q16_ONE            (1 << Q16_SHIFT)              // 0x00010000 = 1.0
#define Q16_HALF           (1 << (Q16_SHIFT - 1))        // 0x00008000 = 0.5
#define Q16_PHI            0x00019E37                    // 1.6180339887 (Golden Ratio)
#define Q16_INV_PHI        0x00009E37                    // 0.6180339887 (1 / Phi)
#define Q16_PI             0x0003243F                    // 3.1415926535
#define Q16_TWO_PI         0x0006487F                    // 6.283185307

#define TO_Q16(x)          ((int32_t)((x) * Q16_ONE))
#define FROM_Q16(x)        ((float)(x) / (float)Q16_ONE)
#define Q16_MUL(a, b)      ((int32_t)(((int64_t)(a) * (int64_t)(b)) >> Q16_SHIFT))
#define Q16_DIV(a, b)      ((int32_t)(((int64_t)(a) << Q16_SHIFT) / (b)))

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
    FB0_MODE_STASIS_LATTICE     = 0, // Phi Recursive Geometric Tessellation
    FB0_MODE_LYAPUNOV_HEATMAP    = 1, // dot{V} Thermodynamic Stasis Cooling vs Friction Flare
    FB0_MODE_INVARIANT_PULSE    = 2, // 432Hz DMA Acoustic Phase Harmonic Breathing
    FB0_MODE_CHAMBER2_SUBLIMATE = 3, // C23 Kernel Seed Sublimation Flare
    FB0_MODE_COMPOSITE_CORTEX   = 4  // Unified Multimodal Cortex
} fb0_render_mode_t;

typedef struct {
    uint32_t width;
    uint32_t height;
    uint32_t pitch;
    uint32_t* vram;
    uint32_t frame_index;
    int32_t  q16_phase_432hz;      // Phase accumulator for 432Hz pulse in Q16.16
    int32_t  q16_lyapunov_v;       // System Lyapunov potential in Q16.16
    int32_t  q16_lyapunov_dot_v;   // Friction / dV/dt in Q16.16
    uint32_t chamber2_deficit_res; // Counter of Chamber 2 deficit resolutions
    uint32_t heavy_seed_id;        // Active sublimated seed ID
    fb0_render_mode_t mode;
} covalent_fb0_context_t;

void covalent_fb0_init(covalent_fb0_context_t* ctx, uint32_t* vram_buffer, uint32_t w, uint32_t h);
void covalent_fb0_render_frame(covalent_fb0_context_t* ctx);
void covalent_fb0_inject_sublimation(covalent_fb0_context_t* ctx, uint32_t seed_id);
void covalent_fb0_step_telemetry(covalent_fb0_context_t* ctx, int32_t dot_v, int32_t v_pot, int32_t audio_phase);

#ifdef __cplusplus
}
#endif

#endif // COVALENT_FB0_DRIVER_H

