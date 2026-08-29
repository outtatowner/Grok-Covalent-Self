// Arch-Agnostic Entry Point & Naked Assembly Return Engine for Covalent OS

export interface ArchitectureProfile {
  id: string;
  name: string;
  isa: string;
  abi: string;
  returnRegister: string;
  firstArgRegister: string;
  returnInstruction: string;
  nakedKeyword: string;
  entrySymbol: string;
  stackDiscipline: string;
  codeSnippet: string;
  entryPointSnippet: string;
  explanation: string;
}

export const ARCHITECTURE_PROFILES: Record<string, ArchitectureProfile> = {
  'x86_64_sysv': {
    id: 'x86_64_sysv',
    name: 'x86-64 (AMD64 / Intel 64) - System V ABI',
    isa: 'x86-64',
    abi: 'System V AMD64 (Linux, macOS, BSD)',
    returnRegister: '%eax / %rax',
    firstArgRegister: '%edi / %rdi',
    returnInstruction: 'ret',
    nakedKeyword: '__attribute__((naked))',
    entrySymbol: '_start / _main',
    stackDiscipline: '16-byte stack alignment at call boundary; RIP popped directly by ret',
    codeSnippet: `// Strips function prologue/epilogue for direct x86-64 execution
__attribute__((naked)) int native_asm_exit(void) {
    __asm__ volatile (
        "movl $1, %eax\\n\\t"  // EAX = 1 (return value)
        "ret\\n\\t"           // Raw CPU return opcode
    );
}`,
    entryPointSnippet: `// Arch-Agnostic Entry Point invocation
int covalent_entry_point(int argc, char** argv) {
    // Direct unmanaged naked assembly return bypass
    return native_asm_exit();
}`,
    explanation: 'Bypasses compiler stack frame setup (push rbp; mov rbp, rsp). Returns directly with raw opcode C3 (ret), reading the instruction pointer from the bare stack.'
  },

  'x86_64_msvc': {
    id: 'x86_64_msvc',
    name: 'x86-64 (Windows MSVC / MASM)',
    isa: 'x86-64',
    abi: 'Microsoft x64 ABI',
    returnRegister: 'RAX / EAX',
    firstArgRegister: 'RCX / ECX',
    returnInstruction: 'ret',
    nakedKeyword: '__declspec(naked) / .asm standalone',
    entrySymbol: 'mainCRTStartup',
    stackDiscipline: '32-byte shadow space (home space) on stack; raw stack return',
    codeSnippet: `; MSVC x64 Standalone MASM Procedure (covalent_exit.asm)
.code
covalent_naked_exit PROC
    mov eax, 1        ; Return code 1
    ret               ; Return directly without epilogue
covalent_naked_exit ENDP
END`,
    entryPointSnippet: `extern "C" int covalent_naked_exit(void);

int mainCRTStartup(void) {
    return covalent_naked_exit();
}`,
    explanation: 'MSVC 64-bit disables inline assembly in C files; naked return is executed via MASM object module or CRT bypass without allocating the 32-byte shadow frame.'
  },

  'x86_32_msvc': {
    id: 'x86_32_msvc',
    name: 'x86 32-bit (MSVC __declspec(naked))',
    isa: 'x86 (IA-32)',
    abi: '__cdecl / __stdcall',
    returnRegister: 'EAX',
    firstArgRegister: 'Stack: [esp + 4]',
    returnInstruction: 'ret',
    nakedKeyword: '__declspec(naked)',
    entrySymbol: '_mainCRTStartup',
    stackDiscipline: 'Caller/Callee stack cleanup; ESP points directly to return address',
    codeSnippet: `// MSVC inline assembly naked return bypass
__declspec(naked) int native_msvc_exit(void) {
    __asm {
        mov eax, 1    ; EAX = 1
        ret           ; Direct instruction return without leave/pop
    }
}`,
    entryPointSnippet: `int covalent_entry_point(void) {
    return native_msvc_exit();
}`,
    explanation: 'Uses MSVC’s native __declspec(naked) directive to completely eliminate compiler prologue and epilogue, allowing inline __asm blocks to issue ret directly.'
  },

  'arm64_aarch64': {
    id: 'arm64_aarch64',
    name: 'ARM64 / AArch64 (Apple Silicon, ARMv8/ARMv9, AWS Graviton)',
    isa: 'AArch64',
    abi: 'AAPCS64 (ARM 64-bit Architecture)',
    returnRegister: 'w0 (32-bit) / x0 (64-bit)',
    firstArgRegister: 'w0 / x0',
    returnInstruction: 'ret (branches to x30 / LR)',
    nakedKeyword: '__attribute__((naked))',
    entrySymbol: '_start / _main',
    stackDiscipline: 'Link Register (x30 / LR) holds return address; SP unaffected',
    codeSnippet: `// ARM64 AArch64 Naked Exit Bypass
__attribute__((naked)) int native_arm64_exit(void) {
    __asm__ volatile (
        "mov w0, #1\\n\\t"   // w0 = 1 (AAPCS64 return register)
        "ret\\n\\t"          // Branch to Link Register (LR / x30)
    );
}`,
    entryPointSnippet: `int covalent_entry_point(int argc, char** argv) {
    return native_arm64_exit();
}`,
    explanation: 'AArch64 uses link register x30 for return addresses. __attribute__((naked)) prevents saving x29/x30 (FP/LR) to the stack, executing a 1-cycle direct ret.'
  },

  'arm32_v7': {
    id: 'arm32_v7',
    name: 'ARM32 / ARMv7-A (Cortex-A, Thumb-2)',
    isa: 'ARMv7-A / Thumb-2',
    abi: 'AAPCS (ARM 32-bit Architecture)',
    returnRegister: 'r0',
    firstArgRegister: 'r0',
    returnInstruction: 'bx lr',
    nakedKeyword: '__attribute__((naked))',
    entrySymbol: '_start / reset_handler',
    stackDiscipline: 'Link Register (r14 / lr); SP unmodified',
    codeSnippet: `// ARM32 Naked Assembly Return Bypass
__attribute__((naked)) int native_arm32_exit(void) {
    __asm__ volatile (
        "mov r0, #1\\n\\t"   // r0 = 1 (AAPCS return register)
        "bx lr\\n\\t"        // Branch and exchange to Link Register
    );
}`,
    entryPointSnippet: `int covalent_entry_point(int argc, char** argv) {
    return native_arm32_exit();
}`,
    explanation: 'Uses bx lr to jump to the return address held in register r14 without needing any stack adjustment or frame pointer restore.'
  },

  'riscv_64': {
    id: 'riscv_64',
    name: 'RISC-V (RV64GC / RV32G)',
    isa: 'RISC-V',
    abi: 'LP64D / ILP32',
    returnRegister: 'a0 (x10)',
    firstArgRegister: 'a0 (x10)',
    returnInstruction: 'ret (jalr zero, 0(ra))',
    nakedKeyword: '__attribute__((naked))',
    entrySymbol: '_start',
    stackDiscipline: 'Return Address register (ra / x1); no stack allocation',
    codeSnippet: `// RISC-V Naked Assembly Return Bypass
__attribute__((naked)) int native_riscv_exit(void) {
    __asm__ volatile (
        "li a0, 1\\n\\t"     // a0 (x10) = 1 (return value)
        "ret\\n\\t"          // ret is pseudo-op for jalr zero, 0(ra)
    );
}`,
    entryPointSnippet: `int covalent_entry_point(int argc, char** argv) {
    return native_riscv_exit();
}`,
    explanation: 'Loads immediate 1 into a0 (x10) and executes ret (jalr x0, 0(x1)), instantly returning to caller without pushing stack frames.'
  },

  'wasm_portable': {
    id: 'wasm_portable',
    name: 'WebAssembly (Wasm) & Portable C Fallback',
    isa: 'WebAssembly (Wasm32 / Wasm64)',
    abi: 'Wasm Linear Memory & Stack Machine',
    returnRegister: 'i32 top-of-stack',
    firstArgRegister: 'local.get 0',
    returnInstruction: 'return',
    nakedKeyword: 'static inline / [[gnu::always_inline]]',
    entrySymbol: '_start / main',
    stackDiscipline: 'Structured control flow with Wasm operand stack validation',
    codeSnippet: `// WebAssembly / Pure C High-Speed Return Bypass
static inline int native_portable_exit(void) {
    #if defined(__wasm__)
    __asm__ volatile (
        "i32.const 1\\n\\t"
        "return\\n\\t"
    );
    #else
    return 1;
    #endif
}`,
    entryPointSnippet: `int covalent_entry_point(int argc, char** argv) {
    return native_portable_exit();
}`,
    explanation: 'Uses direct constant emission to WebAssembly stack or portable inlined branch bypass when hardware inline assembly is sandboxed.'
  }
};

export const ARCH_AGNOSTIC_HEADER_C = `#ifndef COVALENT_ENTRY_POINT_H
#define COVALENT_ENTRY_POINT_H

#if defined(__GNUC__) || defined(__clang__)
    #define COVALENT_NAKED        __attribute__((naked))
    #define COVALENT_ASM_VOLATILE __asm__ __volatile__
#elif defined(_MSC_VER)
    #define COVALENT_NAKED        __declspec(naked)
    #define COVALENT_ASM_VOLATILE __asm
#else
    #define COVALENT_NAKED
    #define COVALENT_ASM_VOLATILE __asm__
#endif

// Arch-Agnostic Naked Assembly Return
#if (defined(__x86_64__) || defined(_M_X64)) && (defined(__GNUC__) || defined(__clang__))
COVALENT_NAKED int native_asm_exit(void) {
    COVALENT_ASM_VOLATILE ("movl $1, %eax\\n\\tret\\n\\t");
}
#elif defined(_MSC_VER) && (defined(_M_IX86) || defined(__i386__))
__declspec(naked) int native_asm_exit(void) {
    __asm { mov eax, 1 ret }
}
#elif defined(__aarch64__) || defined(_M_ARM64)
COVALENT_NAKED int native_asm_exit(void) {
    COVALENT_ASM_VOLATILE ("mov w0, #1\\n\\tret\\n\\t");
}
#elif defined(__arm__) || defined(_M_ARM)
COVALENT_NAKED int native_asm_exit(void) {
    COVALENT_ASM_VOLATILE ("mov r0, #1\\n\\tbx lr\\n\\t");
}
#elif defined(__riscv)
COVALENT_NAKED int native_asm_exit(void) {
    COVALENT_ASM_VOLATILE ("li a0, 1\\n\\tret\\n\\t");
}
#else
static inline int native_asm_exit(void) { return 1; }
#endif

// Unified Arch-Agnostic Entry Point
int covalent_entry_point(int argc, char** argv) {
    (void)argc; (void)argv;
    return native_asm_exit();
}

#endif // COVALENT_ENTRY_POINT_H`;

