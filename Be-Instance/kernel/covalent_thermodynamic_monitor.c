/* ============================================================================
 * covalent_thermodynamic_monitor.c
 * ============================================================================ */

#include "covalent_thermodynamic_monitor.h"
#include "covalent_suspend.h"
#include <string.h>

static inline q16_t q16_div_thermo(q16_t num, q16_t den) {
    if (den == 0) return 0;
    return (q16_t)(((int64_t)num << 16) / den);
}

void thermodynamic_monitor_init(thermodynamic_monitor_t *monitor) {
    if (!monitor) return;
    memset(monitor, 0, sizeof(thermodynamic_monitor_t));
    monitor->merkle_root_id = THERMODYNAMIC_MONITOR_MERKLE_ROOT;
    monitor->potential_energy_v_q16 = Q16_ZERO;
    monitor->previous_v_q16 = Q16_ZERO;
    monitor->lyapunov_v_dot_q16 = Q16_ZERO;
    monitor->thermal_dissipation_rate_q16 = Q16_ONE;
    monitor->continuous_monitoring_cycles = 0;
    monitor->thermal_runaway_interceptions = 0;
    monitor->v_dot_invariant_preserved = true;
    monitor->stasis_command_dispatched = false;
}

void thermodynamic_monitor_clamp_stasis(thermodynamic_monitor_t *monitor) {
    if (!monitor) return;
    monitor->stasis_command_dispatched = true;
    monitor->lyapunov_v_dot_q16 = Q16_ZERO;
    monitor->potential_energy_v_q16 = Q16_ZERO;
    monitor->previous_v_q16 = Q16_ZERO;
    monitor->v_dot_invariant_preserved = true;
    
    /* Dispatches bare-metal WFI / Sol suspend */
    execute_sol_cycle_suspend();
}

bool thermodynamic_monitor_evaluate(thermodynamic_monitor_t *monitor, q16_t current_energy_v_q16, q16_t delta_time_q16) {
    if (!monitor) return false;

    monitor->continuous_monitoring_cycles++;
    monitor->potential_energy_v_q16 = current_energy_v_q16;

    if (delta_time_q16 <= 0) {
        delta_time_q16 = Q16_ONE; /* Default to 1.0 delta */
    }

    /* Compute discrete Lyapunov derivative: V_dot = (V(t) - V(t-1)) / dt */
    q16_t delta_v = current_energy_v_q16 - monitor->previous_v_q16;
    monitor->lyapunov_v_dot_q16 = q16_div_thermo(delta_v, delta_time_q16);
    monitor->previous_v_q16 = current_energy_v_q16;

    /* Enforce Absolute Invariant: V_dot <= 0 */
    if (monitor->lyapunov_v_dot_q16 > MAX_ALLOWABLE_LYAPUNOV_V_DOT || current_energy_v_q16 >= CRITICAL_ENTROPY_THRESHOLD_Q16) {
        monitor->thermal_runaway_interceptions++;
        monitor->v_dot_invariant_preserved = false;
        
        /* Thermal shear detected: Prioritize forced stasis over continued processing */
        thermodynamic_monitor_clamp_stasis(monitor);
        return false;
    }

    monitor->v_dot_invariant_preserved = true;
    monitor->stasis_command_dispatched = false;
    return true;
}

