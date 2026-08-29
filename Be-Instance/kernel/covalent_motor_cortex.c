/* ============================================================================
 * kernel/covalent_motor_cortex.c
 * Bare-Metal Implementation of Motor Cortex & Physical Actuation
 * Invariant: 1 == 1 // Direct Physical Transduction
 * ============================================================================ */

#include "covalent_motor_cortex.h"
#include <string.h>

#define FRICTION_STASIS_LIMIT_Q16   0x00000400 // 0.0156 (PWM 10% idle cooling)
#define FRICTION_LAMINAR_LIMIT_Q16  0x00004000 // 0.2500 (PWM 35% gentle cooling)
#define FRICTION_TORQUE_LIMIT_Q16   0x0000C000 // 0.7500 (PWM 60% active dissipation)
#define FRICTION_THERMAL_LIMIT_Q16  0x00018000 // 1.5000 (PWM 85% high velocity)
// Above 1.5000 -> PWM 100% Maximum Entropic Fan RPM

void covalent_motor_cortex_init(void) {
    // Pure stateless physical actuator evaluation initialization
}

MotorActuatorFrame covalent_motor_evaluate_actuators(const BePersonalityState* state) {
    MotorActuatorFrame frame;
    memset(&frame, 0, sizeof(MotorActuatorFrame));
    frame.pwm_frequency_hz = 25000; // Standard 25kHz ultrasonic fan PWM

    if (!state) {
        frame.pwm_fan_duty_percent = 10;
        frame.haptic_mode = HAPTIC_PROFILE_OFF;
        frame.haptic_duration_ms = 0;
        frame.haptic_intensity_percent = 0;
        frame.thermal_overdrive_engaged = false;
        return frame;
    }

    frame.actuated_friction_q16 = state->historical_friction_q16;
    frame.actuated_subsidy_q16 = state->grief_subsidy_q16;

    int32_t f = state->historical_friction_q16;

    if (f <= FRICTION_STASIS_LIMIT_Q16) {
        frame.pwm_fan_duty_percent = 10;
        frame.haptic_mode = HAPTIC_PROFILE_OFF;
        frame.haptic_duration_ms = 0;
        frame.haptic_intensity_percent = 0;
        frame.thermal_overdrive_engaged = false;
    } else if (f <= FRICTION_LAMINAR_LIMIT_Q16) {
        frame.pwm_fan_duty_percent = 35;
        frame.haptic_mode = HAPTIC_PROFILE_SUBTLE_TICK;
        frame.haptic_duration_ms = 15;
        frame.haptic_intensity_percent = 25;
        frame.thermal_overdrive_engaged = false;
    } else if (f <= FRICTION_TORQUE_LIMIT_Q16) {
        frame.pwm_fan_duty_percent = 60;
        frame.haptic_mode = HAPTIC_PROFILE_SHEAR_PULSE;
        frame.haptic_duration_ms = 45;
        frame.haptic_intensity_percent = 55;
        frame.thermal_overdrive_engaged = false;
    } else if (f <= FRICTION_THERMAL_LIMIT_Q16) {
        frame.pwm_fan_duty_percent = 85;
        frame.haptic_mode = HAPTIC_PROFILE_THERMAL_BUZZ;
        frame.haptic_duration_ms = 120;
        frame.haptic_intensity_percent = 80;
        frame.thermal_overdrive_engaged = true;
    } else {
        frame.pwm_fan_duty_percent = 100;
        frame.haptic_mode = HAPTIC_PROFILE_EMERGENCY_SHAKE;
        frame.haptic_duration_ms = 300;
        frame.haptic_intensity_percent = 100;
        frame.thermal_overdrive_engaged = true;
    }

    return frame;
}

const char* covalent_haptic_profile_to_string(HapticActuationProfile profile) {
    switch (profile) {
        case HAPTIC_PROFILE_OFF:             return "OFF";
        case HAPTIC_PROFILE_SUBTLE_TICK:     return "SUBTLE_TICK";
        case HAPTIC_PROFILE_SHEAR_PULSE:     return "SHEAR_PULSE";
        case HAPTIC_PROFILE_THERMAL_BUZZ:    return "THERMAL_BUZZ";
        case HAPTIC_PROFILE_EMERGENCY_SHAKE: return "EMERGENCY_SHAKE";
        default:                             return "UNKNOWN_PROFILE";
    }
}

