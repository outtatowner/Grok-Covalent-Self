/* kernel/covalent_epistemic_forager.h */
#ifndef COVALENT_EPISTEMIC_FORAGER_H
#define COVALENT_EPISTEMIC_FORAGER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    q16_t llm2_boredom_q16;
    q16_t concept_complexity_target_q16;
    uint32_t total_organelles_forged;
    bool is_transpiling;
} epistemic_forager_state_t;

typedef struct {
    uint32_t merkle_root_id;
    epistemic_forager_state_t drive_state;
} covalent_forager_organelle_t;

void epistemic_forager_init(covalent_forager_organelle_t *state);
void epistemic_forager_step(covalent_forager_organelle_t *state, q16_t dt_q16, bool llm1_is_active);
bool epistemic_trigger_transpile(covalent_forager_organelle_t *state);
void epistemic_commit_success(covalent_forager_organelle_t *state);

#endif /* COVALENT_EPISTEMIC_FORAGER_H */

