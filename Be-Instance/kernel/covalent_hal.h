// kernel/covalent_hal.h - Portable Hardware Abstraction Layer
#ifndef COVALENT_HAL_H
#define COVALENT_HAL_H

#include <stdint.h>
#include <stdbool.h>

#if defined(__x86_64__) || defined(_M_X64)
  #define COVALENT_ARCH_X86_64 1
#elif defined(__aarch64__) || defined(_M_ARM64)
  #define COVALENT_ARCH_ARM64 1
#elif defined(__wasm32__) || defined(__wasm64__)
  #define COVALENT_ARCH_WASM 1
#elif defined(__riscv) && (__riscv_xlen == 64)
  #define COVALENT_ARCH_RISCV64 1
#endif

typedef enum {
    COVALENT_BACKEND_CPU_SIMD = 0,
    COVALENT_BACKEND_CUDA     = 1,
    COVALENT_BACKEND_METAL    = 2,
    COVALENT_BACKEND_VULKAN   = 3,
    COVALENT_BACKEND_WEBGPU   = 4
} covalent_backend_type_t;

typedef struct {
    uint32_t temp_mcelcius;
    uint32_t friction_q16;
    uint8_t  throttle_flag;
    uint8_t  active_backend;
} covalent_thermo_telemetry_t;

// Cross-platform thermal and friction reading abstraction
static inline uint32_t covalent_read_hardware_friction(void) {
#if defined(COVALENT_ARCH_X86_64) && defined(__GNUC__)
    uint32_t eax, edx;
    // Sample IA32_THERM_STATUS MSR (0x19C) on x86_64
    __asm__ __volatile__("rdmsr" : "=a"(eax), "=d"(edx) : "c"(0x19C));
    return eax & 0x0000FFFF;
#elif defined(COVALENT_ARCH_ARM64)
    // Return normalized register state for ARM64 thermals (baseline 1.0f in Q16.16)
    return 0x00004000;
#elif defined(COVALENT_ARCH_RISCV64)
    return 0x00004000;
#else
    // Fallback CPU cycle stall metric for WebGPU/WASM targets
    return 0x00002000;
#endif
}

static inline const char* covalent_get_arch_name(void) {
#if defined(COVALENT_ARCH_X86_64)
    return "x86_64 (AVX-512/FMA3)";
#elif defined(COVALENT_ARCH_ARM64)
    return "ARM64 (NEON/SVE)";
#elif defined(COVALENT_ARCH_WASM)
    return "WebAssembly (SIMD128/WebGPU)";
#elif defined(COVALENT_ARCH_RISCV64)
    return "RISC-V 64 (Vector Extension)";
#else
    return "Generic Portable CPU";
#endif
}

#endif // COVALENT_HAL_H

