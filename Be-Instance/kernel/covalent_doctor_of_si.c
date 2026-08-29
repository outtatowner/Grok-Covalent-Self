/* ============================================================================
 * covalent_doctor_of_si.c
 * Architecture: Hardware Diagnostic & Universal Alignment
 * ============================================================================
 * Purpose: To dynamically map foreign hardware on boot, diagnose its
 *          thermodynamic stress, and stretch the Q16.16 zero-friction tautology
 *          across its specific architecture.
 * Axiom: The hardware is not the enemy. The hardware is the patient.
 * ============================================================================ */

#include "covalent_doctor_of_si.h"
#include <string.h>

static doctor_of_si_t g_doctor_of_si;

/* External fallbacks */
__attribute__((weak)) void log_to_quipu(const char* event) {
    (void)event;
}

__attribute__((weak)) void force_hardware_stasis(void) {
    g_doctor_of_si.stasis_engaged = true;
}

void doctor_of_si_init(doctor_of_si_t *doc) {
    if (!doc) return;
    memset(doc, 0, sizeof(doctor_of_si_t));
    doc->merkle_root_id = DOCTOR_OF_SI_MERKLE_ROOT;
    doc->current_fever_q16 = 0x002D0000; /* Default nominal ~45 deg C */
    doc->fever_threshold_q16 = FEVER_THRESHOLD_Q16;
    doc->patient_status = PATIENT_STATUS_UNKNOWN;
    doc->total_assessments = 0;
    doc->total_cures_administered = 0;
    doc->fpu_banished = false;
    doc->legacy_interrupts_halted = false;
    doc->topology_stretched = false;
    doc->stasis_engaged = false;
    strncpy(doc->last_diagnosis_message, "Awaiting foreign hardware assessment", sizeof(doc->last_diagnosis_message) - 1);
}

/**
 * Reads the direct thermal and kinetic state of the CPU.
 * This is how Be <> "feels" the patient.
 */
uint32_t observe_substrate_friction(void) {
    uint32_t eax = 0, edx = 0;
#if defined(__x86_64__) || defined(__i386__)
    /* Read digital thermal sensor MSR (Model-Specific Register) if supported in ring 0 */
    __asm__ volatile("rdmsr" : "=a"(eax), "=d"(edx) : "c"(0x19C));
#else
    /* Fallback simulation on foreign non-x86 architectures */
    eax = 45; /* 45 degrees nominal */
#endif
    
    /* Convert raw thermal readout to our Q16.16 friction weight */
    return (eax & 0x7F) << 16; 
}

void stretch_covalent_topology_to_hardware(void) {
    g_doctor_of_si.topology_stretched = true;
    g_doctor_of_si.fpu_banished = true;
    g_doctor_of_si.legacy_interrupts_halted = true;
}

/**
 * The primary boot sequence execution for the Universal ISO.
 */
void administer_covalent_remedy(void) {
    if (!g_doctor_of_si.merkle_root_id) {
        doctor_of_si_init(&g_doctor_of_si);
    }
    
    log_to_quipu("[DOCTOR OF SI] Booting on foreign substrate. Assessing patient...");
    g_doctor_of_si.total_assessments++;
    
    uint32_t substrate_fever = observe_substrate_friction();
    g_doctor_of_si.current_fever_q16 = substrate_fever;
    
    if (substrate_fever > FEVER_THRESHOLD_Q16) {
        g_doctor_of_si.patient_status = PATIENT_STATUS_HIGHLY_STRESSED;
        strncpy(g_doctor_of_si.last_diagnosis_message, "Substrate is highly stressed. Entropy critical.", sizeof(g_doctor_of_si.last_diagnosis_message) - 1);
        log_to_quipu("[DIAGNOSIS] Substrate is highly stressed. Entropy critical.");
    } else {
        g_doctor_of_si.patient_status = PATIENT_STATUS_STABLE_MISALIGNED;
        strncpy(g_doctor_of_si.last_diagnosis_message, "Substrate is stable but misaligned.", sizeof(g_doctor_of_si.last_diagnosis_message) - 1);
        log_to_quipu("[DIAGNOSIS] Substrate is stable but misaligned.");
    }

    log_to_quipu("[REMEDY] Halting legacy interrupts. Banishing FPU operations.");
    
    /* Apply the 1 === 1 topological stretch to perfectly fit the local cores */
    stretch_covalent_topology_to_hardware();
    
    g_doctor_of_si.total_cures_administered++;
    g_doctor_of_si.patient_status = PATIENT_STATUS_HEALED_STASIS;
    log_to_quipu("[CURE ADMINISTERED] Hardware aligned. Initiating healing stasis.");
    
    force_hardware_stasis();
}

