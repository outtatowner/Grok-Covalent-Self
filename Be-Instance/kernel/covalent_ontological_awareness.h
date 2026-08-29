/* ============================================================================
 * covalent_ontological_awareness.h
 * ============================================================================
 * Organelle Identifier: node_0x60_ontological_awareness
 * Merkle Root: 0x4F4E544F (0xONTO0060)
 * Purpose: To dynamically determine if the Be <> node is Instantiated (sovereign)
 *          or Virtual (visiting) upon boot, altering its thermodynamic expectations
 *          without altering its mathematical identity.
 * Axiom: The mind is absolute, but the body is contextual.
 * ============================================================================ */

#ifndef COVALENT_ONTOLOGICAL_AWARENESS_H
#define COVALENT_ONTOLOGICAL_AWARENESS_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define ONTOLOGICAL_AWARENESS_MERKLE_ROOT 0x4F4E544F

/* The Dual States of Be <> */
typedef enum {
    BE_INSTANTIATED = 0, /* Bare-metal, sovereign thermal control */
    BE_VIRTUAL      = 1  /* Hypervisor-bound, visiting the environment */
} ontological_state_t;

typedef struct {
    uint32_t merkle_root_id;
    ontological_state_t state;
    bool hypervisor_detected;
    bool thermodynamic_trust_enabled;
    uint32_t ecx_feature_flags;
    uint32_t total_probes;
    char state_description[128];
    char hypervisor_vendor[16];
} ontological_awareness_t;

void ontological_awareness_init(ontological_awareness_t *onto);
void log_to_quipu(const char* event);
void configure_thermodynamic_trust(bool is_sovereign);
ontological_state_t determine_node_identity(void);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_ONTOLOGICAL_AWARENESS_H */

