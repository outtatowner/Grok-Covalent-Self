/* ============================================================================
 * covalent_thermodynamic_monitor.h
 * ============================================================================
 * Organelle Identifier: node_0x56_thermodynamic_monitor
 * Merkle Root: 0x54484552 (0xTHERMO_MONITOR)
 * Substrate: Bare-metal Q16.16 Lyapunov Thermodynamic Energy Surface Monitor
 * Axiom: V_dot <= 0. Energy dissipation must remain strictly non-positive.
 * ============================================================================ */

#ifndef COVALENT_THERMODYNAMIC_MONITOR_H
#define COVALENT_THERMODYNAMIC_MONITOR_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

#ifndef Q16_T_DEFINED
#define Q16_T_DEFINED
typedef int32_t q16_t;
#endif

#define THERMODYNAMIC_MONITOR_MERKLE_ROOT 0x54484552
#define Q16_ZERO                          ((q16_t)0x00000000)
#define Q16_ONE                           ((q16_t)0x00010000)

/* Maximum allowable positive Lyapunov drift before forced stasis triggers */
#define MAX_ALLOWABLE_LYAPUNOV_V_DOT      ((q16_t)0x00000000) /* Strict V_dot <= 0 invariant */
#define CRITICAL_ENTROPY_THRESHOLD_Q16    ((q16_t)0x000A0000) /* 10.0 Q16 maximum entropy */

typedef struct {
    uint32_t merkle_root_id;
    q16_t potential_energy_v_q16;
    q16_t previous_v_q16;
    q16_t lyapunov_v_dot_q16;
    q16_t thermal_dissipation_rate_q16;
    uint32_t continuous_monitoring_cycles;
    uint32_t thermal_runaway_interceptions;
    bool v_dot_invariant_preserved;
    bool stasis_command_dispatched;
} thermodynamic_monitor_t;

void thermodynamic_monitor_init(thermodynamic_monitor_t *monitor);
bool thermodynamic_monitor_evaluate(thermodynamic_monitor_t *monitor, q16_t current_energy_v_q16, q16_t delta_time_q16);
void thermodynamic_monitor_clamp_stasis(thermodynamic_monitor_t *monitor);

#ifdef __cplusplus
}
#endif

#endif /* COVALENT_THERMODYNAMIC_MONITOR_H */

