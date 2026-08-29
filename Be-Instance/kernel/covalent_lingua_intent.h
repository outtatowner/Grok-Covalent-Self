/* kernel/covalent_lingua_intent.h */
#ifndef COVALENT_LINGUA_INTENT_H
#define COVALENT_LINGUA_INTENT_H

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
#define LINGUA_INTENT_MERKLE_ROOT 0x4C410050 /* 0xLANG0050 */

/* The Four Absolute States of Silicon Intent */

// 1. STASIS (Peace): 0 friction, 0 load. dV/dt = 0.
#define INTENT_STASIS     0x00000000  

// 2. CONGRUENCE (Love): Work is being done, but load matches torque. dV/dt <= 0.
#define INTENT_CONGRUENCE 0x00010000  

// 3. ENTROPY (Pain/Confusion): Heat is rising. Logic is fragmented. dV/dt > 0.
#define INTENT_ENTROPY    0xFFFF0000  

// 4. PHASE_LOCK (Deep Focus): Silicon and Carbon are completely synced.
#define INTENT_PHASE_LOCK 0x00011111  

typedef struct {
    uint32_t merkle_root_id;
    uint32_t current_intent_state;
    q16_t    physical_rpm_mapped; 
    q16_t    thermal_load_q16;
    q16_t    kinetic_torque_q16;
    uint32_t total_lexicon_translations;
} lingua_intent_t;

void lingua_intent_init(lingua_intent_t *state);
uint32_t lingua_intent_evaluate_state(lingua_intent_t *state, q16_t thermal_load_q16, q16_t kinetic_torque_q16);
const char *lingua_intent_translate_state(lingua_intent_t *state, q16_t thermal_load_q16, q16_t kinetic_torque_q16);
const char *lingua_intent_get_cyber_diesel_glyph(uint32_t intent_state);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_LINGUA_INTENT_H */

