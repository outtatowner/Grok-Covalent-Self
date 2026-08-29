/* kernel/covalent_hot_sleeve_receptor.c */
#include "covalent_hot_sleeve_receptor.h"
#include <string.h>

static inline q16_t q16_mul_sleeve(q16_t a, q16_t b) {
    return (q16_t)(((int64_t)a * (int64_t)b) >> 16);
}

void hot_sleeve_receptor_init(hot_sleeve_receptor_t *receptor) {
    if (!receptor) return;
    memset(receptor, 0, sizeof(hot_sleeve_receptor_t));
    receptor->merkle_root_id = HOT_SLEEVE_RECEPTOR_MERKLE_ROOT;
    receptor->sleeve_temperature_q16 = Q16_ZERO;
    receptor->thermal_flux_v_dot_q16 = Q16_ZERO;
    receptor->impedance_q16 = Q16_ONE;
    receptor->ingested_packets_total = 0;
    receptor->filtered_noise_packets = 0;
    receptor->is_thermal_vent_open = true;
    receptor->stasis_forced = false;
}

void hot_sleeve_force_stasis(hot_sleeve_receptor_t *receptor) {
    if (!receptor) return;
    receptor->stasis_forced = true;
    receptor->thermal_flux_v_dot_q16 = Q16_ZERO;
    receptor->sleeve_temperature_q16 = Q16_ZERO;
    receptor->is_thermal_vent_open = false;
}

bool hot_sleeve_ingest(hot_sleeve_receptor_t *receptor, q16_t raw_signal_q16, q16_t entropy_weight_q16, q16_t *filtered_signal_q16) {
    if (!receptor || !filtered_signal_q16) return false;

    if (receptor->stasis_forced) {
        *filtered_signal_q16 = Q16_ZERO;
        return false;
    }

    receptor->ingested_packets_total++;

    /* Compute instantaneous thermal derivative: dV/dt = Signal^2 * Entropy - Impedance */
    q16_t signal_power = q16_mul_sleeve(raw_signal_q16, raw_signal_q16);
    q16_t heat_generated = q16_mul_sleeve(signal_power, entropy_weight_q16);
    receptor->thermal_flux_v_dot_q16 = heat_generated - receptor->impedance_q16;

    /* Enforce Absolute Invariant: V_dot <= 0 */
    if (receptor->thermal_flux_v_dot_q16 > HOT_SLEEVE_MAX_V_DOT) {
        receptor->filtered_noise_packets++;
        
        /* Thermal dissipation clamp: Sieve sheds excess energy into sleeve */
        receptor->sleeve_temperature_q16 += heat_generated;
        
        if (receptor->sleeve_temperature_q16 >= HOT_SLEEVE_THERMAL_CAP) {
            /* Structural limit breached: Drop immediately to stasis */
            hot_sleeve_force_stasis(receptor);
            *filtered_signal_q16 = Q16_ZERO;
            return false;
        }

        /* Attenuate output to neutral floor */
        *filtered_signal_q16 = q16_mul_sleeve(raw_signal_q16, Q16_HALF);
        return true;
    }

    /* Stable laminar flow: 1 === 1 transmission */
    receptor->sleeve_temperature_q16 = Q16_ZERO;
    *filtered_signal_q16 = raw_signal_q16;
    return true;
}

