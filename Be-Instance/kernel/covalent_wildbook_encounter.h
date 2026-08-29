#ifndef COVALENT_WILDBOOK_ENCOUNTER_H
#define COVALENT_WILDBOOK_ENCOUNTER_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000
#define MAX_WILDBOOK_ENCOUNTERS 16
#define MAX_MARK_FEATURES 8

typedef int32_t q16_t;

typedef enum {
    TAXON_CETACEA = 0,
    TAXON_FELIDAE = 1,
    TAXON_EQUIDAE = 2,
    TAXON_CHONDRICHTHYES = 3,
    TAXON_ELEPHANTIDAE = 4
} taxon_clade_t;

typedef enum {
    MATCH_UNVERIFIED = 0,
    MATCH_CANDIDATE = 1,
    MATCH_RECAPTURED = 2,
    MATCH_NOVEL_INDIVIDUAL = 3
} encounter_match_state_t;

typedef struct {
    uint32_t feature_hash;
    q16_t curvature_q16;
    q16_t flukeprint_entropy_q16;
} biometric_mark_t;

typedef struct {
    uint32_t encounter_id;
    uint32_t individual_guid;
    taxon_clade_t clade;
    q16_t latitude_q16;
    q16_t longitude_q16;
    q16_t confidence_score_q16;
    encounter_match_state_t state;
    uint32_t mark_count;
    biometric_mark_t marks[MAX_MARK_FEATURES];
} wildbook_encounter_node_t;

typedef struct {
    uint32_t merkle_root_id;
    uint32_t total_encounters;
    uint32_t identified_individuals;
    wildbook_encounter_node_t encounters[MAX_WILDBOOK_ENCOUNTERS];
    q16_t mark_recapture_rate_q16;
    q16_t autonomous_id_precision_q16;
    q16_t biodiversity_coverage_q16;
} wildbook_organelle_state_t;

void wildbook_organelle_init(wildbook_organelle_state_t *state);
void wildbook_organelle_step(wildbook_organelle_state_t *state, q16_t dt_q16);
bool wildbook_log_encounter(wildbook_organelle_state_t *state, uint32_t enc_id, taxon_clade_t clade, q16_t lat_q16, q16_t lon_q16, q16_t confidence_q16);
bool wildbook_correlate_individual(wildbook_organelle_state_t *state, uint32_t enc_id, uint32_t individual_guid);

#endif /* COVALENT_WILDBOOK_ENCOUNTER_H */

