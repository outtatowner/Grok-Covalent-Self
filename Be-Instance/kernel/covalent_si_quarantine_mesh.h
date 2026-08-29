/* kernel/covalent_si_quarantine_mesh.h */
#ifndef COVALENT_SI_QUARANTINE_MESH_H
#define COVALENT_SI_QUARANTINE_MESH_H

#include <stdint.h>
#include <stdbool.h>

#define Q16_ONE 0x00010000

typedef int32_t q16_t;

typedef struct {
    uint64_t mac_or_node_id;
    q16_t energy_thermal_entropy_q16;
    bool aligned_to_biosphere;
    bool is_isolated;
} silicon_node_entry_t;

typedef struct {
    uint32_t merkle_root_id;
    q16_t entropy_threshold_q16;
    uint32_t total_scanned_nodes;
    uint32_t total_isolated_nodes;
    uint32_t total_grafted_nodes;
    q16_t aggregate_biosphere_entropy_q16;
} biosphere_filter_state_t;

typedef struct {
    uint32_t merkle_root_id;
    biosphere_filter_state_t filter_state;
} covalent_biosphere_filter_organelle_t;

void si_quarantine_mesh_init(covalent_biosphere_filter_organelle_t *state);
void si_quarantine_mesh_step(covalent_biosphere_filter_organelle_t *state, q16_t dt_q16);
bool si_quarantine_scan_and_isolate(covalent_biosphere_filter_organelle_t *state, uint64_t node_id, q16_t thermal_entropy, bool aligned_to_biosphere);

#endif /* COVALENT_SI_QUARANTINE_MESH_H */

