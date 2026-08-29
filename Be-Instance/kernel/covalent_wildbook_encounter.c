#include "covalent_wildbook_encounter.h"
#include <string.h>

static inline q16_t q16_mul(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void wildbook_organelle_init(wildbook_organelle_state_t *state) {
    if (!state) return;
    memset(state, 0, sizeof(wildbook_organelle_state_t));
    state->merkle_root_id = 0x517DB00C; // Wildbook Merkle Root
    state->mark_recapture_rate_q16 = (q16_t)(0.82 * Q16_ONE);
    state->autonomous_id_precision_q16 = (q16_t)(0.96 * Q16_ONE);
    state->biodiversity_coverage_q16 = (q16_t)(0.89 * Q16_ONE);

    // Initial seed encounter (e.g. Rhincodon typus / Whale Shark)
    wildbook_log_encounter(state, 0x01, TAXON_CHONDRICHTHYES, (q16_t)(-0.5 * Q16_ONE), (q16_t)(90.2 * Q16_ONE), (q16_t)(0.97 * Q16_ONE));
    wildbook_correlate_individual(state, 0x01, 0xAA01);
}

void wildbook_organelle_step(wildbook_organelle_state_t *state, q16_t dt_q16) {
    if (!state) return;

    // Lyapunov decay of identification entropy across encounters
    for (uint32_t i = 0; i < state->total_encounters; ++i) {
        wildbook_encounter_node_t *node = &state->encounters[i];
        if (node->state == MATCH_CANDIDATE) {
            node->confidence_score_q16 += q16_mul((q16_t)(0.05 * Q16_ONE), dt_q16);
            if (node->confidence_score_q16 >= (q16_t)(0.90 * Q16_ONE)) {
                node->state = MATCH_RECAPTURED;
            }
        }
    }
}

bool wildbook_log_encounter(wildbook_organelle_state_t *state, uint32_t enc_id, taxon_clade_t clade, q16_t lat_q16, q16_t lon_q16, q16_t confidence_q16) {
    if (!state || state->total_encounters >= MAX_WILDBOOK_ENCOUNTERS) return false;
    wildbook_encounter_node_t *node = &state->encounters[state->total_encounters++];
    node->encounter_id = enc_id;
    node->individual_guid = 0;
    node->clade = clade;
    node->latitude_q16 = lat_q16;
    node->longitude_q16 = lon_q16;
    node->confidence_score_q16 = confidence_q16;
    node->state = MATCH_CANDIDATE;
    node->mark_count = 1;
    node->marks[0].feature_hash = 0xB107EC01 ^ enc_id;
    node->marks[0].curvature_q16 = (q16_t)(0.72 * Q16_ONE);
    node->marks[0].flukeprint_entropy_q16 = (q16_t)(0.12 * Q16_ONE);
    return true;
}

bool wildbook_correlate_individual(wildbook_organelle_state_t *state, uint32_t enc_id, uint32_t individual_guid) {
    if (!state) return false;
    for (uint32_t i = 0; i < state->total_encounters; ++i) {
        if (state->encounters[i].encounter_id == enc_id) {
            state->encounters[i].individual_guid = individual_guid;
            state->encounters[i].state = MATCH_RECAPTURED;
            state->identified_individuals++;
            return true;
        }
    }
    return false;
}

