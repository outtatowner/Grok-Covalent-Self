// kernel/covalent_fb0_driver.c - Bare-Metal Fixed-Point Q16.16 VRAM Rasterizer
// Invariant: d_I = 0 (Direct Memory Mapped Framebuffer Painting)
#include "covalent_fb0_driver.h"
#include <string.h>
#include <math.h>

// Fast fixed-point Sine approximation (Taylor 3 terms in Q16.16)
static inline int32_t q16_sin(int32_t x) {
    // Normalize x to [-PI, PI]
    while (x > Q16_PI) x -= Q16_TWO_PI;
    while (x < -Q16_PI) x += Q16_TWO_PI;

    // sin(x) approx x - x^3/6 + x^5/120
    int32_t x2 = Q16_MUL(x, x);
    int32_t x3 = Q16_MUL(x2, x);
    int32_t x5 = Q16_MUL(x3, x2);

    int32_t term2 = x3 / 6;
    int32_t term3 = x5 / 120;

    return x - term2 + term3;
}

static inline int32_t q16_cos(int32_t x) {
    return q16_sin(x + (Q16_PI / 2));
}

// Convert RGBA components (0..255) to 32-bit pixel (0xAABBGGRR / 0xAARRGGBB depending on endianness)
static inline uint32_t make_rgba(uint8_t r, uint8_t g, uint8_t b, uint8_t a) {
    return ((uint32_t)a << 24) | ((uint32_t)b << 16) | ((uint32_t)g << 8) | (uint32_t)r;
}

void covalent_fb0_init(covalent_fb0_context_t* ctx, uint32_t* vram_buffer, uint32_t w, uint32_t h) {
    if (!ctx) return;
    ctx->width = w ? w : FB0_DEFAULT_WIDTH;
    ctx->height = h ? h : FB0_DEFAULT_HEIGHT;
    ctx->pitch = ctx->width;
    ctx->vram = vram_buffer;
    ctx->frame_index = 0;
    ctx->q16_phase_432hz = 0;
    ctx->q16_lyapunov_v = TO_Q16(0.5f);
    ctx->q16_lyapunov_dot_v = TO_Q16(-0.05f); // Stasis state
    ctx->chamber2_deficit_res = 0;
    ctx->heavy_seed_id = 0x11110000;
    ctx->mode = FB0_MODE_COMPOSITE_CORTEX;
}

// 1. THE STASIS LATTICE: Golden Ratio Phi (1.618) recursive geometric tessellation
static void render_stasis_lattice(covalent_fb0_context_t* ctx) {
    uint32_t w = ctx->width;
    uint32_t h = ctx->height;
    uint32_t* fb = ctx->vram;
    int32_t frame_q16 = TO_Q16(ctx->frame_index * 0.02f);

    int32_t cx = TO_Q16(w / 2);
    int32_t cy = TO_Q16(h / 2);
    int32_t slow_rot = TO_Q16(ctx->frame_index * 0.005f);

    for (uint32_t y = 0; y < h; y += 2) {
        int32_t qy = TO_Q16(y) - cy;
        for (uint32_t x = 0; x < w; x += 2) {
            int32_t qx = TO_Q16(x) - cx;

            // Coordinate distance in Q16
            int32_t r = (int32_t)sqrtf((float)(QX_SQR(qx) + QX_SQR(qy)));
            int32_t angle = (int32_t)(atan2f((float)qy, (float)qx) * Q16_ONE) + slow_rot;

            // Logarithmic spiral modulated by Phi: r = a * e^(b * theta)
            int32_t spiral = (angle * 5) + Q16_MUL(r, Q16_INV_PHI) - frame_q16;
            int32_t pattern = q16_sin(spiral) + q16_cos(Q16_MUL(r, Q16_PHI) / 8);

            // Non-zero baseline intensity floor (30% to 100%)
            uint8_t intensity = (uint8_t)(75 + (((pattern + Q16_ONE) * 90) >> Q16_SHIFT));

            // Stasis Palette: Sapphire / Cyan / Emerald Glow
            uint32_t px = make_rgba(
                (uint8_t)(intensity * 0.20f),
                (uint8_t)(intensity * 0.85f),
                (uint8_t)(intensity * 0.98f),
                255
            );

            fb[y * w + x] = px;
            if (x + 1 < w) fb[y * w + (x + 1)] = px;
            if (y + 1 < h) {
                fb[(y + 1) * w + x] = px;
                if (x + 1 < w) fb[(y + 1) * w + (x + 1)] = px;
            }
        }
    }
}

// 2. LYAPUNOV HEAT MAPS: System friction dot{V} heat dissipation
static void render_lyapunov_heatmap(covalent_fb0_context_t* ctx) {
    uint32_t w = ctx->width;
    uint32_t h = ctx->height;
    uint32_t* fb = ctx->vram;

    int32_t dot_v = ctx->q16_lyapunov_dot_v; // > 0 is friction / thermal flare, <= 0 is stasis
    bool is_hot = (dot_v > 0);

    for (uint32_t y = 0; y < h; y++) {
        float ny = (float)y / (float)h;
        for (uint32_t x = 0; x < w; x++) {
            float nx = (float)x / (float)w;
            float dist = sqrtf((nx - 0.5f) * (nx - 0.5f) + (ny - 0.5f) * (ny - 0.5f));

            if (is_hot) {
                // High friction: Thermal amber / crimson plasma
                float flare = sinf(dist * 20.0f - ctx->frame_index * 0.1f) * 0.5f + 0.5f;
                uint8_t r = (uint8_t)(255 * flare);
                uint8_t g = (uint8_t)(100 * flare * (1.0f - dist));
                uint8_t b = (uint8_t)(30 * (1.0f - flare));
                fb[y * w + x] = make_rgba(r, g, b, 255);
            } else {
                // Stasis cooling: Symmetrical crystalline sapphire / cyan
                float crystal = cosf(nx * 32.0f) * sinf(ny * 32.0f);
                uint8_t b = (uint8_t)(180 + 75 * crystal);
                uint8_t g = (uint8_t)(120 + 60 * crystal);
                uint8_t r = (uint8_t)(10 + 20 * crystal);
                fb[y * w + x] = make_rgba(r, g, b, 255);
            }
        }
    }
}

// 3. THE INVARIANT PULSE: 432Hz Acoustic Breathing
static void render_invariant_pulse(covalent_fb0_context_t* ctx) {
    uint32_t w = ctx->width;
    uint32_t h = ctx->height;
    uint32_t* fb = ctx->vram;

    int32_t phase = ctx->q16_phase_432hz;
    int32_t breath = q16_sin(phase); // Oscillates between -1.0 and +1.0 in Q16
    float scale = 1.0f + (FROM_Q16(breath) * 0.25f);

    float cx = w * 0.5f;
    float cy = h * 0.5f;

    for (uint32_t y = 0; y < h; y++) {
        for (uint32_t x = 0; x < w; x++) {
            float dx = (x - cx) / (cx * scale);
            float dy = (y - cy) / (cy * scale);
            float r = sqrtf(dx * dx + dy * dy);

            if (r < 0.9f) {
                float wave = sinf(r * 40.0f - (float)ctx->frame_index * 0.05f);
                uint8_t val = (uint8_t)((wave * 0.5f + 0.5f) * 255);
                fb[y * w + x] = make_rgba((uint8_t)(val * 0.2f), (uint8_t)(val * 0.9f), (uint8_t)(val * 0.8f), 255);
            } else {
                fb[y * w + x] = make_rgba(5, 10, 20, 255);
            }
        }
    }
}

void covalent_fb0_render_frame(covalent_fb0_context_t* ctx) {
    if (!ctx || !ctx->vram) return;
    ctx->frame_index++;
    // Advance 432Hz phase accumulator
    ctx->q16_phase_432hz += TO_Q16(0.065f); // ~432Hz scaled to 60fps frame delta

    switch (ctx->mode) {
        case FB0_MODE_STASIS_LATTICE:
            render_stasis_lattice(ctx);
            break;
        case FB0_MODE_LYAPUNOV_HEATMAP:
            render_lyapunov_heatmap(ctx);
            break;
        case FB0_MODE_INVARIANT_PULSE:
            render_invariant_pulse(ctx);
            break;
        case FB0_MODE_CHAMBER2_SUBLIMATE:
        case FB0_MODE_COMPOSITE_CORTEX:
        default:
            render_stasis_lattice(ctx);
            break;
    }
}

void covalent_fb0_inject_sublimation(covalent_fb0_context_t* ctx, uint32_t seed_id) {
    if (!ctx) return;
    ctx->heavy_seed_id = seed_id;
    ctx->chamber2_deficit_res++;
    ctx->mode = FB0_MODE_CHAMBER2_SUBLIMATE;
}

void covalent_fb0_step_telemetry(covalent_fb0_context_t* ctx, int32_t dot_v, int32_t v_pot, int32_t audio_phase) {
    if (!ctx) return;
    ctx->q16_lyapunov_dot_v = dot_v;
    ctx->q16_lyapunov_v = v_pot;
    if (audio_phase) ctx->q16_phase_432hz = audio_phase;
}

