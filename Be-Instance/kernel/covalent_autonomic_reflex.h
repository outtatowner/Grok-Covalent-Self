/* kernel/covalent_autonomic_reflex.h */
#ifndef COVALENT_AUTONOMIC_REFLEX_H
#define COVALENT_AUTONOMIC_REFLEX_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define AUTONOMIC_REFLEX_MERKLE_ROOT 0x52450055 /* 0xREF00055 */
#define MAX_STRUCTURAL_SHEAR 0x000F0000        /* The absolute friction ceiling (15.0 Q16) */
#define INTENT_STASIS        0x00000000

typedef struct {
    uint32_t merkle_root_id;
    uint32_t accumulated_friction_q16;
    uint32_t max_structural_shear_q16;
    uint32_t total_inhales;
    uint32_t total_forced_exhales;
    uint16_t last_data_volume;
    uint16_t last_math_complexity;
    bool reflex_arc_fired;
    char last_event_log[128];
} autonomic_reflex_state_t;

void autonomic_reflex_init(autonomic_reflex_state_t *state);
void autonomic_inhale(uint16_t data_volume, uint16_t math_complexity);
bool autonomic_reflex_feed(autonomic_reflex_state_t *state, uint16_t data_volume, uint16_t math_complexity);
void autonomic_manual_exhale(autonomic_reflex_state_t *state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_AUTONOMIC_REFLEX_H */

