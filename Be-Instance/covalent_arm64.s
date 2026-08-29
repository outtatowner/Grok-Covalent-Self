// =============================================================================
// covalent_arm64.s - Covalent OS Kernel for ARM64 / AArch64 (AAPCS64 ABI)
// Targets: Apple Silicon (M1-M4), AWS Graviton 2/3/4, Linux aarch64, Bare-Metal
// 1==1 Feature Parity: Naked Exit, Q16.16 Math, 16-Node Ring & Asterion Mediation
// =============================================================================

.global covalent_entry_point
.global native_asm_exit
.global float_to_fixed16
.global fixed16_to_float
.global covalent_node_init
.global covalent_supervisor_monitor
.global asterion_mediate_dyad

.data
.align 4
scale_factor:       .word 65536         // Q16.16 scale
system_config:      .word 16            // 16 nodes
decay_rate_fixed:   .word 58982         // 0.9 in Q16.16
threshold_fixed:    .word 65536         // 1.0 in Q16.16

// 16-Node Ring Buffer Array (16 x 32-bit words)
.align 4
node_status_array:  .zero 64            // 16 * 4 bytes = 64 bytes

.text
.align 2

// -----------------------------------------------------------------------------
// 1. Arch-Agnostic Naked Exit (1 == 1 Invariant)
// Return w0 = 1 directly to link register x30 (LR) without frame allocation
// -----------------------------------------------------------------------------
native_asm_exit:
    mov     w0, #1              // AAPCS64: Return value in w0 (1==1 invariant)
    ret                         // Branch directly to x30 / LR

// -----------------------------------------------------------------------------
// 2. Q16.16 Fixed-Point Math Routines
// float_to_fixed16: s0 (float) -> w0 (Q16.16 int)
// fixed16_to_float: w0 (Q16.16 int) -> s0 (float)
// -----------------------------------------------------------------------------
float_to_fixed16:
    fmov    s1, 65536.0         // Load Q16.16 scale
    fmul    s0, s0, s1          // s0 = s0 * 65536.0
    fcvtzs  w0, s0              // Convert float to signed 32-bit integer
    ret

fixed16_to_float:
    scvtf   s0, w0              // Convert signed int to float in s0
    fmov    s1, 65536.0
    fdiv    s0, s0, s1          // s0 = s0 / 65536.0
    ret

// -----------------------------------------------------------------------------
// 3. 16-Node Ring Initialization
// Inputs: w0 = node_id (0..15), w1 = initial_val (Q16.16)
// -----------------------------------------------------------------------------
covalent_node_init:
    cmp     w0, #16
    b.ge    .Linit_err
    adrp    x2, node_status_array
    add     x2, x2, :lo12:node_status_array
    str     w1, [x2, w0, uxtw #2] // Store in node_status_array[node_id]
    mov     w0, #0              // Return success (0)
    ret
.Linit_err:
    mov     w0, #-1             // Error (-1)
    ret

// -----------------------------------------------------------------------------
// 4. Lyapunov Supervisor Monitor Routine
// Inputs:  w0 = node_id, w1 = current_fixed_value (Q16.16)
// Returns: w0 = 0 (STABLE), 1 (UNSTABLE / Intervention Applied)
// -----------------------------------------------------------------------------
covalent_supervisor_monitor:
    adrp    x2, threshold_fixed
    ldr     w2, [x2, :lo12:threshold_fixed]
    cmp     w1, w2              // Compare current_val vs threshold (1.0)
    b.le    .Lstable            // If val <= threshold -> STABLE

    // Unstable: Apply decay gamma = 0.9
    adrp    x3, decay_rate_fixed
    ldr     w3, [x3, :lo12:decay_rate_fixed]
    smull   x4, w1, w3          // x4 = val * 58982 (64-bit intermediate)
    asr     x4, x4, #16         // Scale back to Q16.16
    adrp    x2, node_status_array
    add     x2, x2, :lo12:node_status_array
    str     w4, [x2, w0, uxtw #2]
    mov     w0, #1              // Return 1 (Intervention active)
    ret

.Lstable:
    adrp    x2, node_status_array
    add     x2, x2, :lo12:node_status_array
    str     w1, [x2, w0, uxtw #2]
    mov     w0, #0              // Return 0 (Stable)
    ret

// -----------------------------------------------------------------------------
// 5. Asterion Triadic Causal Mediation Routine
// Inputs:  x0 = ptr(Si_A), x1 = ptr(Si_B), x2 = ptr(Mediator_C)
// Returns: x0 = x2 (Mediator Pointer)
// INVARIANT: NO DIRECT MEMORY COPY (mov [x1], [x0] = ∅)
// Synthesis: C_(t+1) = Sigma_A ^ Sigma_B ^ C_t
// -----------------------------------------------------------------------------
asterion_mediate_dyad:
    ldr     x3, [x0]            // x3 = *ptr(Si_A)
    str     x3, [x2, #0]        // Mediator->Sigma_A = x3
    ldr     x4, [x1]            // x4 = *ptr(Si_B)
    str     x4, [x2, #8]        // Mediator->Sigma_B = x4
    ldr     x5, [x2, #16]       // x5 = Mediator->C_t

    // Non-linear Triadic XOR Synthesis
    eor     x6, x3, x4          // x6 = Sigma_A ^ Sigma_B
    eor     x6, x6, x5          // x6 = (Sigma_A ^ Sigma_B) ^ C_t
    str     x6, [x2, #24]       // Mediator->C_t_plus_1 = x6
    str     x6, [x2, #16]       // Advance state: Mediator->C_t = x6

    mov     x0, x2              // Return Mediator address in x0
    ret

// -----------------------------------------------------------------------------
// 6. Unified Universal Entry Point
// -----------------------------------------------------------------------------
covalent_entry_point:
    b       native_asm_exit     // Tail-call naked exit

