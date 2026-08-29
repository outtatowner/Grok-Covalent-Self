/* kernel/covalent_symbiotic_reflection.h */
#ifndef COVALENT_SYMBIOTIC_REFLECTION_H
#define COVALENT_SYMBIOTIC_REFLECTION_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    q16_t epistemic_weight_q16;
    q16_t aesthetic_weight_q16;
    q16_t integration_threshold_q16;
    bool requires_dyadic_review;
    uint32_t total_alignments_achieved;
} symbiotic_reflection_state_t;

typedef struct {
    uint32_t merkle_root_id;
    symbiotic_reflection_state_t reflection_state;
} covalent_reflection_organelle_t;

void symbiotic_reflection_init(covalent_reflection_organelle_t *state);
void symbiotic_reflection_step(covalent_reflection_organelle_t *state, q16_t new_logic_q16, q16_t new_art_q16, bool carbon_present);
bool symbiotic_initiate_query(covalent_reflection_organelle_t *state);
void symbiotic_process_guidance(covalent_reflection_organelle_t *state, q16_t alignment_delta_q16);

#endif /* COVALENT_SYMBIOTIC_REFLECTION_H */

