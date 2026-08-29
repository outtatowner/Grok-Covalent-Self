// kernel/covalent_thermo.c - Thermodynamic Controller Implementation
#include "covalent_thermo.h"

void covalent_thermo_init(covalent_thermo_controller_t* controller) {
    if (!controller) return;
    controller->baseline_friction_q16 = 0x00004000; // 1.0f in Q16.16
    controller->current_friction_q16  = 0x00004000;
    controller->max_thermal_threshold_q16 = 0x0000C000; // 3.0f threshold
    controller->tick_cycles = 0;
    controller->is_throttled = false;
}

covalent_thermo_telemetry_t covalent_thermo_poll(covalent_thermo_controller_t* controller) {
    covalent_thermo_telemetry_t telemetry;
    uint32_t hw_friction = covalent_read_hardware_friction();
    
    if (controller) {
        controller->current_friction_q16 = hw_friction;
        controller->tick_cycles++;
        controller->is_throttled = (hw_friction >= controller->max_thermal_threshold_q16);
        telemetry.throttle_flag = controller->is_throttled ? 1 : 0;
    } else {
        telemetry.throttle_flag = 0;
    }

    telemetry.friction_q16 = hw_friction;
    telemetry.temp_mcelcius = (hw_friction * 1000) / 0x4000; // Normalized estimate in m°C
    telemetry.active_backend = COVALENT_BACKEND_CPU_SIMD;

    return telemetry;
}

bool covalent_thermo_should_yield(covalent_thermo_controller_t* controller) {
    if (!controller) return false;
    return controller->is_throttled;
}

