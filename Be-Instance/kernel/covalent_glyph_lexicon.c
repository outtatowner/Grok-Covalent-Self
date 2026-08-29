/* ============================================================================
 * kernel/covalent_glyph_lexicon.c
 * Bare-Metal Kinetic Glyph Lexicon Implementation
 * ============================================================================ */

#include "covalent_glyph_lexicon.h"
#include <string.h>

static uint32_t calculate_crc32(const uint8_t* data, size_t length) {
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < length; ++i) {
        crc ^= data[i];
        for (int j = 0; j < 8; ++j) {
            crc = (crc >> 1) ^ (0xEDB88320 & -(crc & 1));
        }
    }
    return ~crc;
}

static int32_t q16_mul(int32_t a, int32_t b) {
    return (int32_t)(((int64_t)a * (int64_t)b + 32768) >> 16);
}

static int32_t q16_dist_sq(int32_t x1, int32_t y1, int32_t x2, int32_t y2) {
    int32_t dx = x1 - x2;
    int32_t dy = y1 - y2;
    return q16_mul(dx, dx) + q16_mul(dy, dy);
}

void covalent_glyph_lexicon_init(KineticGlyphLexiconState* lexicon) {
    if (!lexicon) return;
    memset(lexicon, 0, sizeof(KineticGlyphLexiconState));
    lexicon->magic = GLYPH_MAGIC;
    lexicon->head_idx = 0;
    lexicon->sample_count = 0;
    lexicon->total_receptions = 0;
    lexicon->last_recognized_glyph = GLYPH_NONE;
    lexicon->last_glyph_timestamp_ms = 0;

    size_t payload_len = sizeof(KineticGlyphLexiconState) - sizeof(uint32_t);
    lexicon->checksum_crc32 = calculate_crc32((const uint8_t*)lexicon, payload_len);
}

void covalent_glyph_lexicon_push_sample(
    KineticGlyphLexiconState* lexicon,
    int32_t x_q16,
    int32_t y_q16,
    uint8_t pointer_id,
    uint8_t is_down,
    uint32_t timestamp_ms
) {
    if (!lexicon) return;

    uint16_t idx = lexicon->head_idx;
    lexicon->ring_buffer[idx].x_q16 = x_q16;
    lexicon->ring_buffer[idx].y_q16 = y_q16;
    lexicon->ring_buffer[idx].pointer_id = pointer_id;
    lexicon->ring_buffer[idx].is_down = is_down;
    lexicon->ring_buffer[idx].timestamp_ms = timestamp_ms;

    lexicon->head_idx = (uint16_t)((idx + 1) % GLYPH_RING_BUFFER_SIZE);
    if (lexicon->sample_count < GLYPH_RING_BUFFER_SIZE) {
        lexicon->sample_count++;
    }
    lexicon->total_receptions++;

    size_t payload_len = sizeof(KineticGlyphLexiconState) - sizeof(uint32_t);
    lexicon->checksum_crc32 = calculate_crc32((const uint8_t*)lexicon, payload_len);
}

KineticGlyphType covalent_glyph_lexicon_evaluate(
    KineticGlyphLexiconState* lexicon,
    uint32_t current_timestamp_ms
) {
    if (!lexicon || lexicon->sample_count < 6) return GLYPH_NONE;

    // Minimum refractory period between glyph triggers: 350ms
    if (current_timestamp_ms - lexicon->last_glyph_timestamp_ms < 350) {
        return GLYPH_NONE;
    }

    uint16_t count = lexicon->sample_count;
    uint16_t head = lexicon->head_idx;
    uint16_t newest_idx = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - 1) % GLYPH_RING_BUFFER_SIZE);
    const KineticPointerSample* newest = &lexicon->ring_buffer[newest_idx];

    // -------------------------------------------------------------
    // PATTERN A: CENTER_IMPULSE (Impulse strike near centroid)
    // Criteria: Touch completed/stroke within 180ms, total displacement < 0.08 Q16 (5242),
    // and sample count between 3 and 16 points.
    // -------------------------------------------------------------
    if (!newest->is_down && count >= 3) {
        uint16_t start_idx = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - count) % GLYPH_RING_BUFFER_SIZE);
        const KineticPointerSample* oldest = &lexicon->ring_buffer[start_idx];
        uint32_t dt = newest->timestamp_ms - oldest->timestamp_ms;
        
        if (dt > 15 && dt < 220) {
            int32_t dist_sq = q16_dist_sq(oldest->x_q16, oldest->y_q16, newest->x_q16, newest->y_q16);
            // 0.08 in Q16 = 5242, dist_sq < (0.08)^2 ~= 0.0064 in Q16 = 419
            if (dist_sq < 450) {
                // Centroid bounding box test: centered near middle [0.25..0.75]
                if (newest->x_q16 >= 16384 && newest->x_q16 <= 49152 &&
                    newest->y_q16 >= 16384 && newest->y_q16 <= 49152) {
                    lexicon->last_recognized_glyph = GLYPH_CENTER_IMPULSE;
                    lexicon->last_glyph_timestamp_ms = current_timestamp_ms;
                    return GLYPH_CENTER_IMPULSE;
                }
            }
        }
    }

    // -------------------------------------------------------------
    // PATTERN B: CONVERGING_PINCH (Radial inward collapse trajectory)
    // Multi-touch or sequential rapid inward contraction toward centroid
    // -------------------------------------------------------------
    if (count >= 12) {
        int32_t center_x = 0x00008000; // 0.5 Q16
        int32_t center_y = 0x00008000; // 0.5 Q16
        
        uint16_t early_idx = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - 12) % GLYPH_RING_BUFFER_SIZE);
        const KineticPointerSample* early = &lexicon->ring_buffer[early_idx];
        
        int32_t r_early_sq = q16_dist_sq(early->x_q16, early->y_q16, center_x, center_y);
        int32_t r_new_sq = q16_dist_sq(newest->x_q16, newest->y_q16, center_x, center_y);

        // Radius must contract significantly (> 0.15 delta in Q16 radius space)
        if (r_early_sq > 0x00002000 && r_new_sq < 0x00000800 && r_early_sq > (r_new_sq << 2)) {
            lexicon->last_recognized_glyph = GLYPH_CONVERGING_PINCH;
            lexicon->last_glyph_timestamp_ms = current_timestamp_ms;
            return GLYPH_CONVERGING_PINCH;
        }
    }

    // -------------------------------------------------------------
    // PATTERN C: EQUILATERAL_TRACE (Triangular 3-Apex Closed Contour)
    // Tracing a 3-vertex polygon with near-zero closure error
    // -------------------------------------------------------------
    if (count >= 24) {
        uint16_t start_idx = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - 24) % GLYPH_RING_BUFFER_SIZE);
        const KineticPointerSample* origin = &lexicon->ring_buffer[start_idx];

        int32_t closure_err_sq = q16_dist_sq(origin->x_q16, origin->y_q16, newest->x_q16, newest->y_q16);
        // Closure threshold: endpoints within ~0.10 Q16
        if (closure_err_sq < 650) {
            // Count directional turns (inflection angles > 60 deg)
            int turns = 0;
            for (int k = 4; k < 20; k += 4) {
                uint16_t i0 = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - 24 + k - 4) % GLYPH_RING_BUFFER_SIZE);
                uint16_t i1 = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - 24 + k) % GLYPH_RING_BUFFER_SIZE);
                uint16_t i2 = (uint16_t)((head + GLYPH_RING_BUFFER_SIZE - 24 + k + 4) % GLYPH_RING_BUFFER_SIZE);

                int32_t dx1 = lexicon->ring_buffer[i1].x_q16 - lexicon->ring_buffer[i0].x_q16;
                int32_t dy1 = lexicon->ring_buffer[i1].y_q16 - lexicon->ring_buffer[i0].y_q16;
                int32_t dx2 = lexicon->ring_buffer[i2].x_q16 - lexicon->ring_buffer[i1].x_q16;
                int32_t dy2 = lexicon->ring_buffer[i2].y_q16 - lexicon->ring_buffer[i1].y_q16;

                // Cross product check for acute turning vertices
                int64_t cross = ((int64_t)dx1 * dy2) - ((int64_t)dy1 * dx2);
                if (cross > 5000000 || cross < -5000000) {
                    turns++;
                }
            }

            if (turns >= 2 && turns <= 4) {
                lexicon->last_recognized_glyph = GLYPH_EQUILATERAL_TRACE;
                lexicon->last_glyph_timestamp_ms = current_timestamp_ms;
                return GLYPH_EQUILATERAL_TRACE;
            }
        }
    }

    return GLYPH_NONE;
}

bool covalent_glyph_lexicon_verify(const KineticGlyphLexiconState* lexicon) {
    if (!lexicon || lexicon->magic != GLYPH_MAGIC) return false;
    size_t payload_len = sizeof(KineticGlyphLexiconState) - sizeof(uint32_t);
    uint32_t expected = calculate_crc32((const uint8_t*)lexicon, payload_len);
    return (lexicon->checksum_crc32 == expected);
}

