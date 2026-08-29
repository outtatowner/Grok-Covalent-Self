/* kernel/covalent_quadbit.c - Native Covalent Quadbit (F2^4 4-Pole Discrete State Engine) */
#include "covalent_quadbit.h"
#include <string.h>

void covalent_quadbit_init(covalent_quadbit_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(covalent_quadbit_state_t));
    state->merkle_root_id = 0x5AD00032; /* 0xQUAD0032 */
    state->primary_word = 0xFEDCBA9876543210ULL; /* Canonical 16-quadbit gradient */
    state->shadow_word = 0x0123456789ABCDEFULL;
    state->quadbit_transitions_count = 0;
    state->average_resonance_q16 = Q16_ONE;
    state->is_syndrome_clean = true;
}

covalent_quadbit_t covalent_quadbit_from_poles(bool si, bool c, bool star, bool ds) {
    covalent_quadbit_t q = 0;
    if (si)   q |= QUADBIT_POLE_SI;
    if (c)    q |= QUADBIT_POLE_C;
    if (star) q |= QUADBIT_POLE_STAR;
    if (ds)   q |= QUADBIT_POLE_DS;
    return q & 0x0F;
}

void covalent_quadbit_to_poles(covalent_quadbit_t q, bool *si, bool *c, bool *star, bool *ds) {
    if (si)   *si   = (q & QUADBIT_POLE_SI) != 0;
    if (c)    *c    = (q & QUADBIT_POLE_C) != 0;
    if (star) *star = (q & QUADBIT_POLE_STAR) != 0;
    if (ds)   *ds   = (q & QUADBIT_POLE_DS) != 0;
}

covalent_quadbit_t covalent_quadbit_and(covalent_quadbit_t a, covalent_quadbit_t b) {
    return (a & b) & 0x0F;
}

covalent_quadbit_t covalent_quadbit_or(covalent_quadbit_t a, covalent_quadbit_t b) {
    return (a | b) & 0x0F;
}

covalent_quadbit_t covalent_quadbit_xor(covalent_quadbit_t a, covalent_quadbit_t b) {
    return (a ^ b) & 0x0F;
}

covalent_quadbit_t covalent_quadbit_not(covalent_quadbit_t a) {
    return (~a) & 0x0F;
}

covalent_quadbit_t covalent_quadbit_rotate(covalent_quadbit_t a, uint8_t shift_bits) {
    shift_bits %= 4;
    covalent_quadbit_t val = a & 0x0F;
    return ((val << shift_bits) | (val >> (4 - shift_bits))) & 0x0F;
}

uint8_t covalent_quadbit_hamming_weight(covalent_quadbit_t a) {
    uint8_t v = a & 0x0F;
    uint8_t count = 0;
    while (v) {
        count += (v & 1);
        v >>= 1;
    }
    return count;
}

q16_t covalent_quadbit_to_q16(covalent_quadbit_t q) {
    uint32_t val = (uint32_t)(q & 0x0F);
    return (q16_t)((val * Q16_ONE) / 15);
}

covalent_quadbit_t covalent_quadbit_from_q16(q16_t val_q16) {
    if (val_q16 <= 0) return 0x0;
    if (val_q16 >= Q16_ONE) return 0xF;
    return (covalent_quadbit_t)((val_q16 * 15 + (Q16_ONE / 2)) >> 16);
}

covalent_quadbit_t covalent_quadbit_word_get(covalent_quadbit_word_t word, uint8_t index_0_to_15) {
    if (index_0_to_15 > 15) return 0;
    uint8_t shift = index_0_to_15 * 4;
    return (covalent_quadbit_t)((word >> shift) & 0x0F);
}

covalent_quadbit_word_t covalent_quadbit_word_set(covalent_quadbit_word_t word, uint8_t index_0_to_15, covalent_quadbit_t val) {
    if (index_0_to_15 > 15) return word;
    uint8_t shift = index_0_to_15 * 4;
    word &= ~(0x0FULL << shift);
    word |= (((uint64_t)(val & 0x0F)) << shift);
    return word;
}

covalent_quadbit_word_t covalent_quadbit_word_merge(covalent_quadbit_word_t a, covalent_quadbit_word_t b) {
    return a | b;
}

covalent_quadbit_word_t covalent_quadbit_word_diff(covalent_quadbit_word_t a, covalent_quadbit_word_t b) {
    return a ^ b;
}

uint8_t covalent_quadbit_word_syndrome(covalent_quadbit_word_t word) {
    /* Fast 4-bit folded parity syndrome across 16 quadbits */
    uint32_t fold = (uint32_t)((word >> 32) ^ (word & 0xFFFFFFFFULL));
    fold = (fold >> 16) ^ (fold & 0xFFFF);
    fold = (fold >> 8) ^ (fold & 0xFF);
    fold = (fold >> 4) ^ (fold & 0x0F);
    return (uint8_t)(fold & 0x0F);
}

