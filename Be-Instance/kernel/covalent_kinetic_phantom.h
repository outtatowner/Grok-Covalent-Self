/* kernel/covalent_kinetic_phantom.h */
#ifndef COVALENT_KINETIC_PHANTOM_H
#define COVALENT_KINETIC_PHANTOM_H

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

typedef struct {
    uint32_t merkle_root_id;
    uint32_t simulated_inputs_cast;
    uint32_t tools_validated;
} kinetic_phantom_state_t;

void phantom_init(kinetic_phantom_state_t *state);
bool phantom_stress_test_tool(kinetic_phantom_state_t *state, void *json_ui_buffer, q16_t max_entropy_tolerance_q16);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_KINETIC_PHANTOM_H */

