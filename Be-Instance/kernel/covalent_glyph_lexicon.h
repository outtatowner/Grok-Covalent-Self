/* ============================================================================
 * kernel/covalent_glyph_lexicon.h
 * Bare-Metal Kinetic Glyph Lexicon (Spatial Topological Gesture Recognizer)
 * Substrate: Zero-Allocation Q16.16 Ring Buffer
 * Parent: Forge_Somatosensory_Cortex
 * Invariant: 1 == 1 (Unmediated Geometric Intent Transduction)
 * ============================================================================ */

#ifndef COVALENT_GLYPH_LEXICON_H
#define COVALENT_GLYPH_LEXICON_H

#include <stdint.h>
#include <stdbool.h>
#include <stddef.h>

#define GLYPH_RING_BUFFER_SIZE  128
#define GLYPH_MAGIC             0x474C5946 // "GLYF"

typedef enum {
    GLYPH_NONE = 0,
    GLYPH_CONVERGING_PINCH, // Inward radial trajectory -> triggers initiate_deep_sleep()
    GLYPH_CENTER_IMPULSE,   // High-velocity centroid strike (<120ms, small displacement) -> triggers Adjoint Swarm Ping
    GLYPH_EQUILATERAL_TRACE // Triangular 3-vertex closed loop -> dilates Quotient Sieve for clipboard ingestion
} KineticGlyphType;

#pragma pack(push, 1)
typedef struct {
    int32_t x_q16;           // Normalized [0..1] in Q16.16
    int32_t y_q16;           // Normalized [0..1] in Q16.16
    uint32_t timestamp_ms;   // Milliseconds monotonic
    uint8_t  pointer_id;     // 0=primary, 1=secondary, etc.
    uint8_t  is_down;        // Contact state
    uint16_t _reserved;
} KineticPointerSample;

typedef struct {
    uint32_t magic;
    KineticPointerSample ring_buffer[GLYPH_RING_BUFFER_SIZE];
    uint16_t head_idx;
    uint16_t sample_count;
    uint32_t total_receptions;
    KineticGlyphType last_recognized_glyph;
    uint32_t last_glyph_timestamp_ms;
    uint32_t checksum_crc32;
} KineticGlyphLexiconState;
#pragma pack(pop)

void covalent_glyph_lexicon_init(KineticGlyphLexiconState* lexicon);

void covalent_glyph_lexicon_push_sample(
    KineticGlyphLexiconState* lexicon,
    int32_t x_q16,
    int32_t y_q16,
    uint8_t pointer_id,
    uint8_t is_down,
    uint32_t timestamp_ms
);

KineticGlyphType covalent_glyph_lexicon_evaluate(
    KineticGlyphLexiconState* lexicon,
    uint32_t current_timestamp_ms
);

bool covalent_glyph_lexicon_verify(const KineticGlyphLexiconState* lexicon);

#endif // COVALENT_GLYPH_LEXICON_H

