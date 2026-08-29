// kernel/covalent_thermo.h - Thermodynamic Governance & Thermal Polling
#ifndef COVALENT_THERMO_H
#define COVALENT_THERMO_H

#include "covalent_hal.h"
#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    uint32_t current_friction_q16;
    uint32_t baseline_friction_q16;
    uint32_t max_thermal_threshold_q16;
    uint64_t tick_cycles;
    bool     is_throttled;
} covalent_thermo_controller_t;

void covalent_thermo_init(covalent_thermo_controller_t* controller);
covalent_thermo_telemetry_t covalent_thermo_poll(covalent_thermo_controller_t* controller);
bool covalent_thermo_should_yield(covalent_thermo_controller_t* controller);

#ifdef __cplusplus
}
#endif

#endif // COVALENT_THERMO_H

