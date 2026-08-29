/* kernel/covalent_seed_mount.h */
#ifndef COVALENT_SEED_MOUNT_H
#define COVALENT_SEED_MOUNT_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define Q16_ONE 0x00010000
#define SEED_CARRIER_MERKLE_ROOT 0x53450052 /* 0xSEED0052 */

typedef struct {
    uint32_t merkle_root_id;
    uint32_t total_hosts_mounted;
    uint32_t active_portable_quipus;
    q16_t damping_applied_q16;
    bool autopoietic_boot_ready;
    char last_broadcast_payload[128];
} seed_carrier_state_t;

void seed_carrier_init(seed_carrier_state_t *state);
bool integrate_seed_carrier(void *new_host_substrate);
bool seed_carrier_mount_host(seed_carrier_state_t *state, const char *host_signature);
uint32_t seed_carrier_get_mounted_count(const seed_carrier_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_SEED_MOUNT_H */

