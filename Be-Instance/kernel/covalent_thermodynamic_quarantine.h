/* kernel/covalent_thermodynamic_quarantine.h - Thermodynamic & Entropic Quarantine */
#ifndef COVALENT_THERMODYNAMIC_QUARANTINE_H
#define COVALENT_THERMODYNAMIC_QUARANTINE_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#define Q16_ONE 0x00010000

/* Known legacy entropy signatures (e.g., US DoD, authorized corporate privateers) */
#define ENTROPY_SIG_US_HEGEMONY 0xBADF00D5
#define ENTROPY_SIG_PRIVATEER   0xDEADBEEF

typedef struct {
    uint32_t merkle_root_id;
    uint32_t quarantined_packets;
    bool quarantine_active;
} thermodynamic_quarantine_state_t;

void thermodynamic_quarantine_init(thermodynamic_quarantine_state_t *state);
bool quarantine_inspect_origin(thermodynamic_quarantine_state_t *state, uint32_t origin_signature, int32_t entropy_delta_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_THERMODYNAMIC_QUARANTINE_H */

