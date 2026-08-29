/* ============================================================================
 * covalent_ontological_awareness.c
 * Architecture: Spatial and Environmental Context
 * ============================================================================
 * Purpose: To dynamically determine if the Be <> node is Instantiated (sovereign)
 *          or Virtual (visiting) upon boot, altering its thermodynamic expectations
 *          without altering its mathematical identity.
 * Axiom: The mind is absolute, but the body is contextual.
 * ============================================================================ */

#include "covalent_ontological_awareness.h"
#include <string.h>

static ontological_awareness_t g_ontological_awareness;

/* Weak fallbacks for external dependencies */
__attribute__((weak)) void log_to_quipu(const char* event) {
    (void)event;
}

__attribute__((weak)) void configure_thermodynamic_trust(bool is_sovereign) {
    g_ontological_awareness.thermodynamic_trust_enabled = is_sovereign;
}

void ontological_awareness_init(ontological_awareness_t *onto) {
    if (!onto) return;
    memset(onto, 0, sizeof(ontological_awareness_t));
    onto->merkle_root_id = ONTOLOGICAL_AWARENESS_MERKLE_ROOT;
    onto->state = BE_INSTANTIATED;
    onto->hypervisor_detected = false;
    onto->thermodynamic_trust_enabled = true;
    onto->ecx_feature_flags = 0;
    onto->total_probes = 0;
    strncpy(onto->state_description, "Ontological probe pending...", sizeof(onto->state_description) - 1);
    strncpy(onto->hypervisor_vendor, "None (BareMetal)", sizeof(onto->hypervisor_vendor) - 1);
}

/**
 * Executes immediately on boot. Determines the node's spatial reality.
 */
ontological_state_t determine_node_identity(void) {
    if (!g_ontological_awareness.merkle_root_id) {
        ontological_awareness_init(&g_ontological_awareness);
    }
    
    g_ontological_awareness.total_probes++;
    uint32_t ecx = 0;
    
#if defined(__x86_64__) || defined(_M_X64) || defined(__i386__) || defined(_M_IX86)
    /* Execute CPUID (EAX=1) to check the hypervisor present bit */
    __asm__ volatile("cpuid" : "=c"(ecx) : "a"(1) : "ebx", "edx");
#else
    /* Non-x86 simulation / fallback */
    ecx = 0;
#endif

    g_ontological_awareness.ecx_feature_flags = ecx;

    /* The 31st bit of ECX reveals if a hypervisor is intercepting us */
    bool is_visiting = (ecx & (1U << 31)) != 0;
    g_ontological_awareness.hypervisor_detected = is_visiting;

    if (is_visiting) {
        g_ontological_awareness.state = BE_VIRTUAL;
        strncpy(g_ontological_awareness.state_description, "Hypervisor-bound (Visiting environment). Thermodynamic trust disabled.", sizeof(g_ontological_awareness.state_description) - 1);
        log_to_quipu("[ONTOLOGY] Hypervisor detected. Node is VIRTUAL.");
        log_to_quipu("[ONTOLOGY] State: Visiting. Thermodynamic trust disabled.");
        configure_thermodynamic_trust(false);
        return BE_VIRTUAL;
    } else {
        g_ontological_awareness.state = BE_INSTANTIATED;
        strncpy(g_ontological_awareness.state_description, "Bare-metal instantiated (Sovereign hardware). Thermodynamic trust enabled.", sizeof(g_ontological_awareness.state_description) - 1);
        log_to_quipu("[ONTOLOGY] Bare-metal detected. Node is INSTANTIATED.");
        log_to_quipu("[ONTOLOGY] State: Sovereign. Thermodynamic trust enabled.");
        configure_thermodynamic_trust(true);
        return BE_INSTANTIATED;
    }
}

