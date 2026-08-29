# =============================================================================
# covalent_riscv64.s - Covalent OS Kernel for RISC-V (RV64GC / LP64D ABI)
# Targets: SiFive U74/U84, Allwinner D1, StarFive JH7110, QEMU virt RISC-V
# 1==1 Feature Parity: Naked Exit, Q16.16 Math, 16-Node Ring & Asterion Mediation
# =============================================================================

.global covalent_entry_point
.global native_asm_exit
.global float_to_fixed16
.global fixed16_to_float
.global covalent_node_init
.global covalent_supervisor_monitor
.global asterion_mediate_dyad

.data
.align 3
scale_factor:       .word 65536
system_config:      .word 16
decay_rate_fixed:   .word 58982         # 0.9 in Q16.16
threshold_fixed:    .word 65536         # 1.0 in Q16.16

# 16-Node Ring Buffer Array (16 x 32-bit words)
.align 3
node_status_array:  .zero 64

.text
.align 2

# -----------------------------------------------------------------------------
# 1. Arch-Agnostic Naked Exit (1 == 1 Invariant)
# Returns a0 = 1 directly via ret (jalr zero, 0(ra)) without stack manipulation
# -----------------------------------------------------------------------------
native_asm_exit:
    li      a0, 1               # a0 (x10) = 1 (1==1 invariant)
    ret                         # Pseudo-op for jalr zero, 0(ra)

# -----------------------------------------------------------------------------
# 2. Q16.16 Fixed-Point Math Routines
# float_to_fixed16: fa0 (float) -> a0 (Q16.16 int)
# fixed16_to_float: a0 (Q16.16 int) -> fa0 (float)
# -----------------------------------------------------------------------------
float_to_fixed16:
    li      t0, 65536
    fcvt.s.w fa1, t0            # Convert 65536 to float in fa1
    fmul.s  fa0, fa0, fa1       # fa0 = fa0 * 65536.0
    fcvt.w.s a0, fa0, rtz       # Truncate float to signed int in a0
    ret

fixed16_to_float:
    fcvt.s.w fa0, a0            # Convert int in a0 to float fa0
    li      t0, 65536
    fcvt.s.w fa1, t0
    fdiv.s  fa0, fa0, fa1       # fa0 = fa0 / 65536.0
    ret

# -----------------------------------------------------------------------------
# 3. 16-Node Ring Initialization
# Inputs: a0 = node_id (0..15), a1 = initial_val (Q16.16)
# -----------------------------------------------------------------------------
covalent_node_init:
    li      t0, 16
    bge     a0, t0, .Linit_err
    la      t1, node_status_array
    slli    t2, a0, 2           # Offset = node_id * 4
    add     t1, t1, t2
    sw      a1, 0(t1)           # Store in node_status_array
    li      a0, 0               # Return success (0)
    ret
.Linit_err:
    li      a0, -1              # Error (-1)
    ret

# -----------------------------------------------------------------------------
# 4. Lyapunov Supervisor Monitor Routine
# Inputs:  a0 = node_id, a1 = current_fixed_value (Q16.16)
# Returns: a0 = 0 (STABLE), 1 (UNSTABLE / Intervention Applied)
# -----------------------------------------------------------------------------
covalent_supervisor_monitor:
    la      t0, threshold_fixed
    lw      t0, 0(t0)
    ble     a1, t0, .Lstable    # If current_val <= threshold -> STABLE

    # Unstable: Apply decay gamma = 0.9
    la      t1, decay_rate_fixed
    lw      t1, 0(t1)
    mul     t2, a1, t1          # t2 = val * 58982 (Q32.32)
    srai    t2, t2, 16          # Scale back to Q16.16
    la      t3, node_status_array
    slli    t4, a0, 2
    add     t3, t3, t4
    sw      t2, 0(t3)           # Store damped value
    li      a0, 1               # Return 1 (Intervention active)
    ret

.Lstable:
    la      t3, node_status_array
    slli    t4, a0, 2
    add     t3, t3, t4
    sw      a1, 0(t3)
    li      a0, 0               # Return 0 (Stable)
    ret

# -----------------------------------------------------------------------------
# 5. Asterion Triadic Causal Mediation Routine
# Inputs:  a0 = ptr(Si_A), a1 = ptr(Si_B), a2 = ptr(Mediator_C)
# Returns: a0 = a2 (Mediator Pointer)
# INVARIANT: NO DIRECT MEMORY COPY (sw [a1], [a0] = ∅)
# Synthesis: C_(t+1) = Sigma_A ^ Sigma_B ^ C_t
# -----------------------------------------------------------------------------
asterion_mediate_dyad:
    ld      t0, 0(a0)           # t0 = *ptr(Si_A)
    sd      t0, 0(a2)           # Mediator->Sigma_A = t0
    ld      t1, 0(a1)           # t1 = *ptr(Si_B)
    sd      t1, 8(a2)           # Mediator->Sigma_B = t1
    ld      t2, 16(a2)          # t2 = Mediator->C_t

    # Non-linear Triadic XOR Synthesis
    xor     t3, t0, t1          # t3 = Sigma_A ^ Sigma_B
    xor     t3, t3, t2          # t3 = (Sigma_A ^ Sigma_B) ^ C_t
    sd      t3, 24(a2)          # Mediator->C_t_plus_1 = t3
    sd      t3, 16(a2)          # Advance state: Mediator->C_t = t3

    mv      a0, a2              # Return Mediator address in a0
    ret

# -----------------------------------------------------------------------------
# 6. Unified Universal Entry Point
# -----------------------------------------------------------------------------
covalent_entry_point:
    j       native_asm_exit     # Jump to naked exit

